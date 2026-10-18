import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:webview_flutter/webview_flutter.dart';

/// Wird beim Bauen von GitHub gesetzt (laufende Nummer des Builds).
const int kBuildNumber = int.fromEnvironment('BUILD_NUMBER', defaultValue: 0);
const String kRepoOwner = 'hatzi84';
const String kRepoName = '-a320-lernapp-neu';
const MethodChannel kChannel = MethodChannel('bzf/update');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations(DeviceOrientation.values);
  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  runApp(const LernApp());
}

class LernApp extends StatelessWidget {
  const LernApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'A320 Lernapp',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4A9AF0),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0F141B),
        useMaterial3: true,
      ),
      home: const WebHome(),
    );
  }
}

// ---------------------------------------------------------------------------
// Update-Prüfung über GitHub
// ---------------------------------------------------------------------------

class UpdateInfo {
  UpdateInfo(this.build, this.browserUrl, this.apiUrl);

  final int build;
  final String browserUrl;
  final String apiUrl;
}

Future<UpdateInfo?> fetchLatest() async {
  final headers = <String, String>{
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  final r = await http
      .get(
        Uri.parse(
          'https://api.github.com/repos/$kRepoOwner/$kRepoName/releases/latest',
        ),
        headers: headers,
      )
      .timeout(const Duration(seconds: 20));
  if (r.statusCode != 200) {
    throw Exception('GitHub antwortet mit Status ${r.statusCode}');
  }
  final j = jsonDecode(r.body) as Map<String, dynamic>;
  final tag = (j['tag_name'] as String?) ?? '';
  final build = int.tryParse(tag.replaceFirst('build-', '')) ?? 0;
  String? browser;
  String? api;
  final assets = (j['assets'] as List<dynamic>?) ?? <dynamic>[];
  for (final a in assets) {
    final m = a as Map<String, dynamic>;
    final name = (m['name'] as String?) ?? '';
    if (name.endsWith('.apk')) {
      browser = m['browser_download_url'] as String?;
      api = m['url'] as String?;
      break;
    }
  }
  if (browser == null || api == null) return null;
  return UpdateInfo(build, browser, api);
}

/// Öffnet den Download der APK (das Repo ist öffentlich, kein Schlüssel nötig).
Future<http.StreamedResponse> openApk(UpdateInfo info, http.Client client) {
  return client.send(http.Request('GET', Uri.parse(info.browserUrl)));
}

// ---------------------------------------------------------------------------
// Start: die Inhalte (Webseiten in den App-Dateien) im Vollbild
// ---------------------------------------------------------------------------

class WebHome extends StatefulWidget {
  const WebHome({super.key});

  @override
  State<WebHome> createState() => _WebHomeState();
}

class _WebHomeState extends State<WebHome> {
  late final WebViewController _web;
  bool _updateAvailable = false;

  @override
  void initState() {
    super.initState();
    _web = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F141B))
      ..addJavaScriptChannel(
        'App',
        onMessageReceived: (m) {
          if (m.message == 'update') _openUpdate();
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) => _markPage(),
          onNavigationRequest: (req) {
            if (req.url.startsWith('vpa://update')) {
              _openUpdate();
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadFlutterAsset('assets/web/index.html');
    _checkUpdate();
  }

  Future<void> _checkUpdate() async {
    try {
      final u = await fetchLatest();
      if (!mounted) return;
      _updateAvailable = u != null && u.build > kBuildNumber;
      _markPage();
    } catch (_) {
      // Offline: kein Hinweis, die App läuft trotzdem.
    }
  }

  void _markPage() {
    final version = kBuildNumber == 0 ? 'Entwicklungsversion' : 'Build $kBuildNumber';
    _web.runJavaScript(
      "var v=document.getElementById('ver');if(v)v.textContent='Version: $version';"
      "${_updateAvailable ? "document.documentElement.setAttribute('data-update','1');" : ''}",
    );
  }

  Future<void> _openUpdate() async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const UpdatePage()),
    );
    _checkUpdate();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        // Zuerst die Seite fragen: Reiter, Kapitel oder Unterseite schließen.
        try {
          final r = await _web.runJavaScriptReturningResult(
            "(window.vpaBack && window.vpaBack()) ? 'yes' : 'no'",
          );
          if (r.toString().contains('yes')) return;
        } catch (_) {}
        if (await _web.canGoBack()) {
          await _web.goBack();
        } else {
          await SystemNavigator.pop();
        }
      },
      child: Scaffold(
        body: SafeArea(child: WebViewWidget(controller: _web)),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Update-Seite
// ---------------------------------------------------------------------------

class UpdatePage extends StatefulWidget {
  const UpdatePage({super.key});

  @override
  State<UpdatePage> createState() => _UpdatePageState();
}

class _UpdatePageState extends State<UpdatePage> {
  String _status = 'Noch nicht geprüft.';
  double? _progress;
  bool _busy = false;
  UpdateInfo? _info;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    setState(() {
      _busy = true;
      _status = 'Suche nach Updates …';
      _info = null;
      _progress = null;
    });
    try {
      final info = await fetchLatest();
      if (!mounted) return;
      if (info == null) {
        setState(() {
          _status = 'Noch keine veröffentlichte Version gefunden.';
          _busy = false;
        });
      } else if (info.build > kBuildNumber) {
        setState(() {
          _info = info;
          _status = 'Neue Version verfügbar: Build ${info.build}.';
          _busy = false;
        });
      } else {
        setState(() {
          _status = 'Du hast die neueste Version.';
          _busy = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _status = 'Prüfung fehlgeschlagen: $e';
        _busy = false;
      });
    }
  }

  Future<void> _install() async {
    final info = _info;
    if (info == null) return;
    setState(() {
      _busy = true;
      _status = 'Lade Update herunter …';
      _progress = 0;
    });
    try {
      final dir = await kChannel.invokeMethod<String>('cacheDir');
      if (dir == null) throw Exception('Kein Zwischenspeicher gefunden');
      final file = File('$dir/update.apk');
      final client = http.Client();
      try {
        final resp = await openApk(info, client);
        if (resp.statusCode != 200) {
          throw Exception('Download-Status ${resp.statusCode}');
        }
        final total = resp.contentLength ?? 0;
        var got = 0;
        final sink = file.openWrite();
        await for (final chunk in resp.stream) {
          sink.add(chunk);
          got += chunk.length;
          if (total > 0 && mounted) {
            setState(() => _progress = got / total);
          }
        }
        await sink.close();
      } finally {
        client.close();
      }
      final res = await kChannel.invokeMethod<String>(
        'installApk',
        <String, dynamic>{'path': file.path},
      );
      if (!mounted) return;
      setState(() {
        _busy = false;
        _progress = null;
        if (res == 'needs_permission') {
          _status = 'Erlaube dieser App einmalig, Apps zu installieren, und '
              'tippe dann nochmal auf „Update installieren“.';
        } else {
          _status = 'Installation gestartet. Bestätige den Dialog von Android.';
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _progress = null;
        _status = 'Update fehlgeschlagen: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Update')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              kBuildNumber == 0
                  ? 'Installiert: Entwicklungsversion'
                  : 'Installiert: Build $kBuildNumber',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Text(_status),
            if (_progress != null) ...[
              const SizedBox(height: 12),
              LinearProgressIndicator(value: _progress),
            ],
            const SizedBox(height: 24),
            Wrap(
              spacing: 8,
              children: [
                OutlinedButton(
                  onPressed: _busy ? null : _check,
                  child: const Text('Nach Update suchen'),
                ),
                if (_info != null)
                  FilledButton(
                    onPressed: _busy ? null : _install,
                    child: const Text('Update installieren'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
