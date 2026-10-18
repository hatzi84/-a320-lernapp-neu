"""Passt das frisch erzeugte Android-Gerüst an (Rechte, Update-Installation, Name).

Wird im GitHub-Workflow nach `flutter create` ausgeführt, im Ordner des Repos.
"""
import pathlib
import re
import shutil
import sys

PATCH = pathlib.Path(__file__).resolve().parent
ANDROID = pathlib.Path("android")

# 1) Manifest: Rechte, FileProvider, App-Name
manifest = ANDROID / "app/src/main/AndroidManifest.xml"
text = manifest.read_text(encoding="utf-8")

permissions = (
    '    <uses-permission android:name="android.permission.INTERNET"/>\n'
    '    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES"/>\n'
)
if "REQUEST_INSTALL_PACKAGES" not in text:
    text = text.replace("<application", permissions + "    <application", 1)

provider = """        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"/>
        </provider>
"""
if "FileProvider" not in text:
    text = text.replace("</application>", provider + "    </application>", 1)

text = re.sub(r'android:label="[^"]*"', 'android:label="A320 Lernapp"', text, count=1)
manifest.write_text(text, encoding="utf-8")

# 2) Pfade für den FileProvider
xml_dir = ANDROID / "app/src/main/res/xml"
xml_dir.mkdir(parents=True, exist_ok=True)
shutil.copy(PATCH / "file_paths.xml", xml_dir / "file_paths.xml")

# 3) MainActivity ersetzen (Update-Kanal)
candidates = list((ANDROID / "app/src/main").rglob("MainActivity.kt"))
if not candidates:
    sys.exit("MainActivity.kt nicht gefunden")
activity = candidates[0]
match = re.search(r"^package\s+([\w.]+)", activity.read_text(encoding="utf-8"), re.M)
if not match:
    sys.exit("Paketname nicht gefunden")
template = (PATCH / "MainActivity.kt.tmpl").read_text(encoding="utf-8")
activity.write_text(template.replace("__PACKAGE__", match.group(1)), encoding="utf-8")

# 4) Festen Signaturschlüssel erzwingen (sonst nimmt Gradle bei jedem Bau einen neuen Zufallsschlüssel
#    und Android lehnt jedes Update mit "Paket steht in Konflikt" ab)
kts = ANDROID / "app/build.gradle.kts"
groovy = ANDROID / "app/build.gradle"
if kts.exists():
    g = kts.read_text(encoding="utf-8")
    block = """
    signingConfigs {
        getByName("debug") {
            storeFile = file("../../keystore/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }
"""
elif groovy.exists():
    g = groovy.read_text(encoding="utf-8")
    block = """
    signingConfigs {
        debug {
            storeFile file("../../keystore/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
    }
"""
else:
    sys.exit("build.gradle(.kts) nicht gefunden")
if "keystore/debug.keystore" not in g:
    g, n = re.subn(r"(^android\s*\{[^\n]*\n)", lambda m: m.group(1) + block, g, count=1, flags=re.M)
    if n != 1:
        sys.exit("android { Block nicht gefunden")
    (kts if kts.exists() else groovy).write_text(g, encoding="utf-8")

print("Android-Gerüst angepasst:", activity)
