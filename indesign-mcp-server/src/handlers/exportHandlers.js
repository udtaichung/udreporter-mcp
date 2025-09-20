/**
 * Export handlers
 */
import { ScriptExecutor } from '../core/scriptExecutor.js';
import { formatResponse, escapeJsxString, escapeFilePathForJsx } from '../utils/stringUtils.js';

export class ExportHandlers {
    /**
     * Export document to PDF
     */
    static async exportPDF(args) {
        // Support both schema variants: {filePath, preset} or {filePath, quality, pages, includeBleed, includeMarks}
        const filePath = args.filePath;
        const pages = args.pages || args.pageRange || 'all';
        const quality = args.quality || null; // PRESS/PRINT/SCREEN/DIGITAL
        const preset = args.preset || (quality === 'PRESS' ? 'Press Quality' : quality === 'PRINT' ? 'High Quality Print' : 'Smallest File Size');

        const escapedFilePath = escapeFilePathForJsx(filePath);
        const escapedPreset = escapeJsxString(preset);

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            '  var pdfFile = File("' + escapedFilePath + '");',
            '',
            '  try {',
            '    // Ensure target directory exists',
            '    var targetFolder = pdfFile.parent;',
            '    if (targetFolder && !targetFolder.exists) {',
            '      try { targetFolder.create(); } catch (fe) {}',
            '    }',
            '',
            '    // Page range preference (best-effort)',
            `    try { app.pdfExportPreferences.pageRange = "${pages}"; } catch(e) {}`,
            '    // Export to PDF with preset',
            '    doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, "' + escapedPreset + '");',
            '',
            `    "PDF exported successfully to: ${escapedFilePath}";`,
            '  } catch (error) {',
            '    "Error exporting PDF: " + error.message;',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Export PDF");
    }

    /**
     * Export pages as images
     */
    static async exportImages(args) {
        // Support alias: outputPath (types) vs folderPath (handler)
        const folderPath = args.folderPath || args.outputPath;
        const format = args.format || 'JPEG';
        const quality = args.quality ?? 80;
        const resolution = args.resolution ?? 300;
        const pageRange = args.pageRange || args.pages || 'all';

        const escapedFolderPath = escapeFilePathForJsx(folderPath);

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            '  var folder = Folder("' + escapedFolderPath + '");',
            '',
            '  try {',
            '    if (!folder.exists) {',
            '      folder.create();',
            '    }',
            '',
            '    var exportedCount = 0;',
            '    var pagesToExport = [];',
            `    if ("${pageRange}" !== "all") {`,
            '      var parts = "' + pageRange + '".split(",");',
            '      for (var i=0; i<parts.length; i++) {',
            '        var seg = parts[i];',
            '        if (seg.indexOf("-") >= 0) {',
            '          var ab = seg.split("-");',
            '          var a = parseInt(ab[0],10), b = parseInt(ab[1],10);',
            '          if (!isNaN(a) && !isNaN(b)) {',
            '            for (var p=a; p<=b; p++) { if (p>=1 && p<=doc.pages.length) pagesToExport.push(p); }',
            '          }',
            '        } else {',
            '          var p = parseInt(seg,10); if (!isNaN(p) && p>=1 && p<=doc.pages.length) pagesToExport.push(p);',
            '        }',
            '      }',
            '    } else {',
            '      for (var i=1; i<=doc.pages.length; i++) pagesToExport.push(i);',
            '    }',
            '',
            '    // Configure JPEG export preferences',
            '    var fmt = ("' + format + '" || "JPEG").toUpperCase();',
            '    if (fmt !== "JPEG") fmt = "JPEG"; // Fallback to JPEG for now',
            '    app.jpegExportPreferences.exportResolution = ' + resolution + ';',
            '    // Map quality 0-100 to enum',
            '    var q = ' + quality + ';',
            '    var qual = JPEGOptionsQuality.HIGH;',
            '    try {',
            '      if (q >= 95) qual = JPEGOptionsQuality.MAXIMUM; else if (q >= 75) qual = JPEGOptionsQuality.HIGH; else if (q >= 50) qual = JPEGOptionsQuality.MEDIUM; else qual = JPEGOptionsQuality.LOW;',
            '      app.jpegExportPreferences.jpegQuality = qual;',
            '    } catch (_) {}',
            '',
            '    for (var idx=0; idx<pagesToExport.length; idx++) {',
            '      var pageNum = pagesToExport[idx];',
            '      var fileName = folder.fsName + "/page_" + pageNum + ".jpg";',
            '      var imageFile = File(fileName);',
            '      app.jpegExportPreferences.pageString = String(pageNum);',
            '      doc.exportFile(ExportFormat.JPG, imageFile, false);',
            '      exportedCount++;',
            '    }',
            '',
            `    exportedCount + " pages exported as JPEG images to: ${escapedFolderPath}";`,
            '  } catch (error) {',
            '    "Error exporting images: " + error.message;',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Export Images");
    }

    /**
     * Package document for printing
     */
    static async packageDocument(args) {
        const folderPath = args.folderPath || args.outputPath;
        const { includeFonts = true, includeLinks = true, includeProfiles = true } = args;
        const escapedFolderPath = escapeFilePathForJsx(folderPath);

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            '  var folder = Folder("' + escapedFolderPath + '");',
            '',
            '  try {',
            '    if (!folder.exists) {',
            '      folder.create();',
            '    }',
            '',
            '    // Set package preferences',
            '    var packagePrefs = doc.packagePreferences;',
            `    packagePrefs.includeFonts = ${includeFonts};`,
            `    packagePrefs.includeLinks = ${includeLinks};`,
            `    packagePrefs.includeProfiles = ${includeProfiles};`,
            '    packagePrefs.includeNonPrinting = false;',
            '    packagePrefs.includeHiddenLayers = false;',
            '    packagePrefs.includeEmptyPages = true;',
            '',
            '    // Package the document',
            '    doc.packageForPrint(folder);',
            '',
            `    "Document packaged successfully to: ${escapedFolderPath}";`,
            '  } catch (error) {',
            '    "Error packaging document: " + error.message;',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Package Document");
    }

    /**
     * Export document to EPUB (basic)
     */
    static async exportEPUB(args) {
        const { filePath } = args;
        const escapedFilePath = escapeFilePathForJsx(filePath);

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            '  var epubFile = File("' + escapedFilePath + '");',
            '  try {',
            '    var folder = epubFile.parent; if (folder && !folder.exists) { try { folder.create(); } catch(e) {} }',
            '    doc.exportFile(ExportFormat.EPUB, epubFile, false);',
            `    "EPUB exported successfully to: ${escapedFilePath}";`,
            '  } catch (error) {',
            '    "Error exporting EPUB: " + error.message;',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, 'Export EPUB');
    }
}
