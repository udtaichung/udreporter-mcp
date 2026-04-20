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
        const rawPageRange = args.pages ?? args.pageRange ?? 'all';
        const pageRangeString = typeof rawPageRange === 'string' ? rawPageRange : String(rawPageRange ?? 'all');
        const normalizedPageRange = pageRangeString.trim() === '' ? 'all' : pageRangeString.trim();
        const quality = args.quality || null; // PRESS/PRINT/SCREEN/DIGITAL
        const presetCandidate = args.preset || (quality === 'PRESS' ? 'Press Quality' : quality === 'PRINT' ? 'High Quality Print' : 'Smallest File Size');
        const preset = typeof presetCandidate === 'string' && presetCandidate.trim() !== '' ? presetCandidate : 'High Quality Print';

        const escapedFilePath = escapeFilePathForJsx(filePath);
        const escapedPreset = escapeJsxString(preset);
        const escapedPageRange = escapeJsxString(normalizedPageRange);

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
            `    try { app.pdfExportPreferences.pageRange = "${escapedPageRange}"; } catch(e) {}`,
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
        const rawPageRange = args.pageRange ?? args.pages ?? 'all';
        const pageRangeString = typeof rawPageRange === 'string' ? rawPageRange : String(rawPageRange ?? 'all');
        const trimmedRange = pageRangeString.trim();
        const canonicalPageRange = trimmedRange === '' ? 'all' : (trimmedRange.toLowerCase() === 'all' ? 'all' : trimmedRange);

        const escapedFolderPath = escapeFilePathForJsx(folderPath);
        const escapedPageRange = escapeJsxString(canonicalPageRange);
        const normalizedFormat = typeof format === 'string' ? format.trim().toUpperCase() : 'JPEG';
        const supportedFormats = new Set(['JPEG']);
        const safeFormat = supportedFormats.has(normalizedFormat) ? normalizedFormat : 'JPEG';
        const escapedFormat = escapeJsxString(safeFormat);

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
            `    if ("${escapedPageRange}" !== "all") {`,
            `      var parts = "${escapedPageRange}".split(",");`,
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
            `    var fmt = "${escapedFormat}";`,
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

    /**
     * Export document to IDML (InDesign Markup Language interchange format).
     *
     * IDML is an unpacked XML (ZIP archive) representation of the InDesign
     * document, used for version control, round-tripping through external
     * tools, and lossless interchange. Unlike `save_document` (which writes
     * the proprietary `.indd` binary), this tool preserves the document as
     * IDML for workflows that need the XML-editable form back.
     */
    static async exportIDML(args) {
        const { filePath } = args;
        const escapedFilePath = escapeFilePathForJsx(filePath);

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            '  var idmlFile = File("' + escapedFilePath + '");',
            '  try {',
            '    var folder = idmlFile.parent; if (folder && !folder.exists) { try { folder.create(); } catch(e) {} }',
            '    doc.exportFile(ExportFormat.INDESIGN_MARKUP, idmlFile, false);',
            `    "IDML exported successfully to: ${escapedFilePath}";`,
            '  } catch (error) {',
            '    "Error exporting IDML: " + error.message;',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, 'Export IDML');
    }
}
