// src/components/admin/payroll/shared/downloadFile.ts
//
// On the web, files were downloaded via `URL.createObjectURL(blob)` + a
// hidden <a download> click. React Native has no DOM/Blob/anchor, so instead
// we write the content to the app's document directory and hand it to the
// OS share sheet (AirDrop / Save to Files / Gmail / WhatsApp / etc.) via
// expo-sharing. This lets the user save or forward the file exactly like a
// download would on web.
//
// Requires: `expo-file-system` and `expo-sharing`
//   npx expo install expo-file-system expo-sharing

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

type SaveAndShareOptions = {
  /** Raw text content, e.g. a CSV string or HTML report string */
  content: string;
  /** File name including extension, e.g. "payroll-2026-07.csv" */
  filename: string;
  /** Mime type for the share sheet, defaults based on extension */
  mimeType?: string;
};

export async function saveAndShareText({
  content,
  filename,
  mimeType,
}: SaveAndShareOptions) {
  try {
    const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
    if (!dir)
      throw new Error("No writable directory available on this device.");

    const fileUri = `${dir}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: mimeType ?? guessMimeType(filename),
        dialogTitle: `Save or share ${filename}`,
        UTI: filename.endsWith(".csv")
          ? "public.comma-separated-values-text"
          : undefined,
      });
    } else {
      Alert.alert(
        "Saved",
        `File saved to ${Platform.OS === "ios" ? "the Files app" : fileUri}`,
      );
    }
    return fileUri;
  } catch (err: any) {
    Alert.alert("Download failed", err?.message ?? "Could not save this file.");
    throw err;
  }
}

/**
 * Convenience wrapper for API calls that already return response `data` as
 * a string (CSV/HTML). If your `payrollApi` layer still returns a web Blob
 * (from an axios call with `responseType: "blob"`), read it into text first,
 * e.g. `await (blob as any).text()`, before calling this helper — React
 * Native's Blob polyfill does support `.text()`.
 */
export async function downloadBlobOrText(
  data: Blob | string,
  filename: string,
  mimeType?: string,
) {
  const content = typeof data === "string" ? data : await (data as any).text();
  return saveAndShareText({ content, filename, mimeType });
}

function guessMimeType(filename: string) {
  if (filename.endsWith(".csv")) return "text/csv";
  if (filename.endsWith(".html")) return "text/html";
  if (filename.endsWith(".pdf")) return "application/pdf";
  if (filename.endsWith(".json")) return "application/json";
  return "text/plain";
}
