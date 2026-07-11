using System.Text;
using CUE4Parse.Encryption.Aes;
using CUE4Parse.FileProvider;
using CUE4Parse.FileProvider.Objects;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Objects.Core.Misc;
using CUE4Parse.UE4.Versions;
using CUE4Parse.MappingsProvider.Usmap;
using CUE4Parse.UE4.Wwise;
using CUE4Parse_Conversion.Textures;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Serilog;

namespace PaldleExtractor;

public static class Program
{
    // ---- Configuration (env-overridable) ----
    static string PaksDir => Environment.GetEnvironmentVariable("PALDLE_PAKS")
        ?? @"D:\Palworld-Game\Palworld\Pal\Content\Paks";
    static string UsmapPath => Environment.GetEnvironmentVariable("PALDLE_USMAP")
        ?? Path.Combine(AppContext.BaseDirectory, "assets", "mappings.usmap");
    static string OutDir => Environment.GetEnvironmentVariable("PALDLE_OUT")
        ?? @"D:\paldle-website\scripts\datamine\out";

    // Palworld pak is unencrypted -> zero AES key with the empty (zero) GUID.
    const string ZeroAes = "0x0000000000000000000000000000000000000000000000000000000000000000";

    static DefaultFileProvider BuildProvider(bool needMappings)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Warning()
            .WriteTo.Console()
            .CreateLogger();

        Console.Error.WriteLine($"[provider] paks   = {PaksDir}");
        Console.Error.WriteLine($"[provider] usmap  = {UsmapPath} (exists={File.Exists(UsmapPath)})");

        var provider = new DefaultFileProvider(
            PaksDir,
            SearchOption.AllDirectories,
            new VersionContainer(EGame.GAME_UE5_1),
            StringComparer.OrdinalIgnoreCase);

        if (File.Exists(UsmapPath))
            provider.MappingsContainer = new FileUsmapTypeMappingsProvider(UsmapPath);
        else if (needMappings)
            throw new FileNotFoundException(
                $"Mappings (.usmap) required for this command but not found at {UsmapPath}. " +
                "Drop the Palworld Mappings.usmap there (or set PALDLE_USMAP).");

        provider.Initialize();
        provider.SubmitKey(new FGuid(), new FAesKey(ZeroAes));
        provider.PostMount();

        Console.Error.WriteLine($"[provider] mounted, {provider.Files.Count} files visible.");
        return provider;
    }

    public static int Main(string[] args)
    {
        if (args.Length == 0)
        {
            Console.WriteLine("""
                PaldleExtractor commands:
                  list [filter]                 -> write all file paths (optionally containing <filter>) to out/manifest.txt
                  exts                          -> histogram of file extensions
                  dump <objectPath> [outName]   -> serialize a package's exports to JSON (out/dump/<name>.json)
                  tables <subdir> name=path ... -> dump many datatables in one mount to out/<subdir>/<name>.json
                  textures <substr> <subdir>    -> decode all UTexture2D whose path contains <substr> to PNG in out/<subdir>
                  export <substr> <subdir>      -> write raw bytes of files whose path contains <substr> to out/<subdir>
                """);
            return 0;
        }

        Directory.CreateDirectory(OutDir);
        var cmd = args[0].ToLowerInvariant();

        try
        {
            switch (cmd)
            {
                case "list":   return CmdList(args.Length > 1 ? args[1] : null);
                case "exts":   return CmdExts();
                case "dump":   return CmdDump(args[1], args.Length > 2 ? args[2] : null);
                case "tables": return CmdTables(args[1], args.Skip(2).ToArray());
                case "textures": return CmdTextures(args[1], args[2]);
                case "export": return CmdExport(args[1], args[2]);
                case "wwiseinspect": return CmdWwiseInspect(args[1]);
                case "wwise": return CmdWwise(args[1], args[2]);
                case "media": return CmdMedia(args[1], args[2]);
                case "bpscan": return CmdBpScan(args[1]);
                default:
                    Console.Error.WriteLine($"Unknown command: {cmd}");
                    return 1;
            }
        }
        catch (Exception e)
        {
            Console.Error.WriteLine($"FATAL: {e}");
            return 2;
        }
    }

    static int CmdList(string? filter)
    {
        var provider = BuildProvider(needMappings: false);
        var keys = provider.Files.Keys
            .Where(k => filter == null || k.Contains(filter, StringComparison.OrdinalIgnoreCase))
            .OrderBy(k => k, StringComparer.OrdinalIgnoreCase)
            .ToList();
        var outFile = Path.Combine(OutDir, filter == null ? "manifest.txt" : $"manifest_{Sanitize(filter)}.txt");
        File.WriteAllLines(outFile, keys);
        Console.WriteLine($"Wrote {keys.Count} paths -> {outFile}");
        foreach (var k in keys.Take(40)) Console.WriteLine("  " + k);
        if (keys.Count > 40) Console.WriteLine($"  ... (+{keys.Count - 40} more)");
        return 0;
    }

    static int CmdExts()
    {
        var provider = BuildProvider(needMappings: false);
        var hist = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var k in provider.Files.Keys)
        {
            var ext = Path.GetExtension(k);
            if (string.IsNullOrEmpty(ext)) ext = "(none)";
            hist[ext] = hist.GetValueOrDefault(ext) + 1;
        }
        foreach (var kv in hist.OrderByDescending(x => x.Value))
            Console.WriteLine($"{kv.Value,10}  {kv.Key}");
        return 0;
    }

    static int CmdDump(string objectPath, string? outName)
    {
        var provider = BuildProvider(needMappings: true);
        var pkg = provider.LoadPackage(objectPath);
        var exports = pkg.GetExports().ToList();
        var json = JsonConvert.SerializeObject(exports, Formatting.Indented);
        var dir = Path.Combine(OutDir, "dump");
        Directory.CreateDirectory(dir);
        var name = outName ?? Sanitize(objectPath.Split('/').Last());
        var outFile = Path.Combine(dir, name + ".json");
        File.WriteAllText(outFile, json);
        Console.WriteLine($"Dumped {exports.Count} export(s) -> {outFile} ({json.Length} chars)");
        // Print a short preview
        Console.WriteLine(json.Length > 4000 ? json[..4000] + "\n... (truncated)" : json);
        return 0;
    }

    static int CmdTables(string subdir, string[] pairs)
    {
        var provider = BuildProvider(needMappings: true);
        var outPath = Path.Combine(OutDir, subdir);
        Directory.CreateDirectory(outPath);
        int ok = 0, fail = 0;
        foreach (var pair in pairs)
        {
            var eq = pair.IndexOf('=');
            if (eq < 0) { Console.Error.WriteLine($"  bad pair (need name=path): {pair}"); fail++; continue; }
            var name = pair[..eq];
            var objPath = pair[(eq + 1)..];
            try
            {
                var exports = provider.LoadPackage(objPath).GetExports().ToList();
                var json = JsonConvert.SerializeObject(exports, Formatting.Indented);
                File.WriteAllText(Path.Combine(outPath, name + ".json"), json);
                Console.WriteLine($"  {name,-16} <- {objPath}  ({json.Length} chars)");
                ok++;
            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"  ERR {name} <- {objPath}: {e.Message}");
                fail++;
            }
        }
        Console.WriteLine($"tables done: {ok} ok, {fail} failed -> {outPath}");
        return fail == 0 ? 0 : 1;
    }

    static int CmdTextures(string substr, string subdir)
    {
        var provider = BuildProvider(needMappings: true);
        var outPath = Path.Combine(OutDir, subdir);
        Directory.CreateDirectory(outPath);

        var candidates = provider.Files.Keys
            .Where(k => k.EndsWith(".uasset", StringComparison.OrdinalIgnoreCase)
                        && k.Contains(substr, StringComparison.OrdinalIgnoreCase))
            .OrderBy(k => k, StringComparer.OrdinalIgnoreCase)
            .ToList();

        Console.WriteLine($"{candidates.Count} candidate .uasset paths match '{substr}'");
        int ok = 0, skip = 0, fail = 0;
        foreach (var key in candidates)
        {
            var pkgPath = key[..key.LastIndexOf('.')]; // strip .uasset
            try
            {
                UTexture2D? tex = null;
                foreach (var exp in provider.LoadPackage(pkgPath).GetExports())
                {
                    if (exp is UTexture2D t) { tex = t; break; }
                }
                if (tex == null) { skip++; continue; }

                var decoded = tex.Decode(ETexturePlatform.DesktopMobile);
                if (decoded == null) { fail++; Console.Error.WriteLine($"  decode-null: {pkgPath}"); continue; }

                var png = decoded.Encode(ETextureFormat.Png, false, out _);
                // preserve the folder structure under <substr> so assets stay browsable by category
                var idx = key.IndexOf(substr, StringComparison.OrdinalIgnoreCase);
                var rel = idx >= 0 ? key[(idx + substr.Length)..] : Path.GetFileName(key);
                rel = rel[..rel.LastIndexOf('.')]; // strip .uasset
                var outFile = Path.Combine(outPath, rel.Replace('/', Path.DirectorySeparatorChar) + ".png");
                Directory.CreateDirectory(Path.GetDirectoryName(outFile)!);
                File.WriteAllBytes(outFile, png);
                ok++;
                if (ok % 50 == 0) Console.WriteLine($"  ... {ok} PNGs written");
            }
            catch (Exception e)
            {
                fail++;
                Console.Error.WriteLine($"  ERR {pkgPath}: {e.Message}");
            }
        }
        Console.WriteLine($"textures done: {ok} written, {skip} non-texture, {fail} failed -> {outPath}");
        return 0;
    }

    static int CmdExport(string substr, string subdir)
    {
        var provider = BuildProvider(needMappings: false);
        var outPath = Path.Combine(OutDir, subdir);
        Directory.CreateDirectory(outPath);

        var candidates = provider.Files
            .Where(kv => kv.Key.Contains(substr, StringComparison.OrdinalIgnoreCase))
            .ToList();

        Console.WriteLine($"{candidates.Count} files match '{substr}'");
        int ok = 0, fail = 0;
        foreach (var (key, file) in candidates)
        {
            try
            {
                var data = file.Read();
                // preserve relative-ish name: flatten path under substr
                var rel = key.Replace('/', '_');
                File.WriteAllBytes(Path.Combine(outPath, rel), data);
                ok++;
                if (ok % 100 == 0) Console.WriteLine($"  ... {ok} files written");
            }
            catch (Exception e)
            {
                fail++;
                Console.Error.WriteLine($"  ERR {key}: {e.Message}");
            }
        }
        Console.WriteLine($"export done: {ok} written, {fail} failed -> {outPath}");
        return 0;
    }

    static WwiseReader ParseBank(DefaultFileProvider provider, GameFile file)
    {
        var data = file.Read();
        var ar = new FWwiseArchive(file.Path, data, provider.Versions);
        return new WwiseReader(ar, new WwiseGameFileSource(file));
    }

    static int CmdWwiseInspect(string bnkSubstr)
    {
        var provider = BuildProvider(needMappings: false);
        var banks = provider.Files
            .Where(kv => kv.Key.EndsWith(".bnk", StringComparison.OrdinalIgnoreCase)
                        && kv.Key.Contains(bnkSubstr, StringComparison.OrdinalIgnoreCase))
            .Take(5).ToList();
        Console.WriteLine($"{banks.Count} banks match (showing up to 5):");
        foreach (var (key, file) in banks)
        {
            Console.WriteLine($"\n### {key}");
            try
            {
                var r = ParseBank(provider, file);
                Console.WriteLine($"  embedded medias: {r.WwiseEncodedMedias.Count}  " +
                    $"[{string.Join(", ", r.WwiseEncodedMedias.Select(m => $"{m.Key}:{m.Value.GetData().Length}b").Take(6))}]");
                Console.WriteLine($"  WemIndexes: {(r.WemIndexes?.Length ?? 0)}  Hierarchies: {(r.Hierarchies?.Length ?? 0)}");
                var dumpDir = Path.Combine(OutDir, "dump");
                Directory.CreateDirectory(dumpDir);
                var full = JsonConvert.SerializeObject(new { r.Hierarchies, r.WemIndexes, r.BankIDToFileName }, Formatting.Indented);
                var bf = Path.Combine(dumpDir, "bank_" + Sanitize(Path.GetFileNameWithoutExtension(key)) + ".json");
                File.WriteAllText(bf, full);
                Console.WriteLine($"  full HIRC -> {bf}");
            }
            catch (Exception e) { Console.WriteLine($"  ERR: {e.Message}"); }
        }
        return 0;
    }

    const string MediaDir = "Pal/Content/WwiseAudio/Media/";

    // Extract streamed wems by SourceId listed (one per line) in a file -> out/<subdir>/<id>.wem
    static int CmdMedia(string listFile, string subdir)
    {
        var provider = BuildProvider(needMappings: false);
        var outPath = Path.Combine(OutDir, subdir);
        Directory.CreateDirectory(outPath);
        var ids = File.ReadAllLines(listFile).Select(l => l.Trim()).Where(l => l.Length > 0).Distinct().ToList();
        Console.WriteLine($"{ids.Count} media ids to extract");
        int ok = 0, missing = 0;
        foreach (var id in ids)
        {
            if (provider.Files.TryGetValue(MediaDir + id + ".wem", out var f))
            {
                File.WriteAllBytes(Path.Combine(outPath, id + ".wem"), f.Read());
                ok++;
                if (ok % 200 == 0) Console.WriteLine($"  ... {ok} wems");
            }
            else { missing++; Console.Error.WriteLine($"  missing: {id}"); }
        }
        Console.WriteLine($"media done: {ok} wems, {missing} missing -> {outPath}");
        return 0;
    }

    static int CmdWwise(string bnkSubstr, string subdir)
    {
        var provider = BuildProvider(needMappings: false);
        var outPath = Path.Combine(OutDir, subdir);
        Directory.CreateDirectory(outPath);
        var banks = provider.Files
            .Where(kv => kv.Key.EndsWith(".bnk", StringComparison.OrdinalIgnoreCase)
                        && kv.Key.Contains(bnkSubstr, StringComparison.OrdinalIgnoreCase))
            .ToList();
        Console.WriteLine($"{banks.Count} banks match '{bnkSubstr}'");
        int wems = 0, empty = 0, fail = 0, missing = 0;
        foreach (var (key, file) in banks)
        {
            var bankBase = Path.GetFileNameWithoutExtension(key);
            try
            {
                var r = ParseBank(provider, file);
                var written = new HashSet<string>();

                // 1) embedded media (DIDX/DATA)
                foreach (var (name, deferred) in r.WwiseEncodedMedias)
                {
                    var bytes = deferred.GetData();
                    if (bytes.Length == 0) continue;
                    File.WriteAllBytes(Path.Combine(outPath, $"{bankBase}__{name}.wem"), bytes);
                    written.Add(name); wems++;
                }

                // 2) streamed media referenced by HIRC SourceId -> Media/<id>.wem
                if (r.Hierarchies is { Length: > 0 })
                {
                    var hj = JToken.Parse(JsonConvert.SerializeObject(r.Hierarchies));
                    var ids = hj.SelectTokens("$..SourceId").Select(t => t.ToString())
                        .Where(s => !string.IsNullOrEmpty(s) && s != "0").Distinct();
                    foreach (var id in ids)
                    {
                        if (!written.Add(id)) continue;
                        if (provider.Files.TryGetValue(MediaDir + id + ".wem", out var mediaFile))
                        {
                            File.WriteAllBytes(Path.Combine(outPath, $"{bankBase}__{id}.wem"), mediaFile.Read());
                            wems++;
                        }
                        else missing++;
                    }
                }
                if (written.Count == 0) empty++;
            }
            catch (Exception e) { fail++; Console.Error.WriteLine($"  ERR {bankBase}: {e.Message}"); }
        }
        Console.WriteLine($"wwise done: {wems} wems written, {empty} banks w/o media, {missing} media-not-found, {fail} failed -> {outPath}");
        return 0;
    }

    // Scan every pal actor blueprint for movement/ride markers -> out/<sub>/bp-markers.json
    static int CmdBpScan(string subdir)
    {
        var provider = BuildProvider(needMappings: true);
        var outPath = Path.Combine(OutDir, subdir);
        Directory.CreateDirectory(outPath);

        // canonical pal BP: PalActorBP/<X>/BP_<X>.uasset  (skip _BOSS/_Police/... variants)
        var re = new System.Text.RegularExpressions.Regex(@"PalActorBP/([^/]+)/BP_\1\.uasset$",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        var bps = provider.Files.Keys.Select(k => (key: k, m: re.Match(k))).Where(x => x.m.Success)
            .Select(x => (name: x.m.Groups[1].Value, path: x.key[..x.key.LastIndexOf('.')]))
            .DistinctBy(x => x.name).OrderBy(x => x.name).ToList();
        Console.WriteLine($"{bps.Count} pal blueprints to scan");

        var tokenRe = new System.Text.RegularExpressions.Regex(
            @"[A-Za-z_0-9]*(Ride|Fly|Swim|Aqua|Water|Dive|Saddle|Marker|Nav|Glide|Amphi|Mount)[A-Za-z_0-9]*",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        var ridePosRe = new System.Text.RegularExpressions.Regex(@"""RidePositionType""\s*:\s*""([^""]+)""");

        var result = new Dictionary<string, object>();
        int done = 0;
        foreach (var (name, path) in bps)
        {
            try
            {
                var json = JsonConvert.SerializeObject(provider.LoadPackage(path).GetExports());
                var tokens = tokenRe.Matches(json).Select(m => m.Value).Distinct()
                    .Where(t => t.Length > 3).OrderBy(t => t).ToList();
                var rp = ridePosRe.Matches(json).Select(m => m.Groups[1].Value).Distinct().ToList();
                result[name] = new { fly = json.Contains("PalFlyMeshHeightCtrl"), ridePos = rp, tokens };
            }
            catch (Exception e) { result[name] = new { error = e.Message }; }
            if (++done % 50 == 0) Console.WriteLine($"  ... {done}/{bps.Count}");
        }
        var outFile = Path.Combine(outPath, "bp-markers.json");
        File.WriteAllText(outFile, JsonConvert.SerializeObject(result, Formatting.Indented));
        Console.WriteLine($"bpscan done: {result.Count} pals -> {outFile}");
        return 0;
    }

    static string Sanitize(string s)
    {
        var sb = new StringBuilder(s.Length);
        foreach (var c in s) sb.Append(Path.GetInvalidFileNameChars().Contains(c) ? '_' : c);
        return sb.ToString();
    }
}
