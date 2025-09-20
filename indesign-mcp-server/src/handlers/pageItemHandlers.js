/**
 * PageItem management handlers
 */
import { ScriptExecutor } from '../core/scriptExecutor.js';
import { formatResponse, escapeJsxString } from '../utils/stringUtils.js';

export class PageItemHandlers {
    /**
     * Get information about a page item
     */
    static async getPageItemInfo(args) {
        const { pageIndex, itemIndex } = args;

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            `    if (${itemIndex} >= page.allPageItems.length) {`,
            '      "Page item index out of range";',
            '    } else {',
            `      var item = page.allPageItems[${itemIndex}];`,
            '      var info = "=== PAGE ITEM INFO ===\\n";',
            '      info += "Type: " + item.constructor.name + "\\n";',
            '      info += "Name: " + (item.name || "Unnamed") + "\\n";',
            '      info += "ID: " + item.id + "\\n";',
            '      info += "Visible: " + item.visible + "\\n";',
            '      info += "Locked: " + item.locked + "\\n";',
            '      info += "Bounds: " + item.geometricBounds.join(", ") + "\\n";',
            '      info += "Fill Color: " + (item.fillColor ? item.fillColor.name : "None") + "\\n";',
            '      info += "Stroke Color: " + (item.strokeColor ? item.strokeColor.name : "None") + "\\n";',
            '      info += "Stroke Weight: " + item.strokeWeight + "\\n";',
            '      info;',
            '    }',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Get Page Item Info");
    }

    /**
     * Select a page item
     */
    static async selectPageItem(args) {
        const { pageIndex, itemIndex, existingSelection = 'REPLACE_WITH' } = args;

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            `    if (${itemIndex} >= page.allPageItems.length) {`,
            '      "Page item index out of range";',
            '    } else {',
            `      var item = page.allPageItems[${itemIndex}];`,
            `      item.select(SelectionOptions.${existingSelection});`,
            '      "Page item selected successfully";',
            '    }',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Select Page Item");
    }

    /**
     * Move a page item
     */
    static async movePageItem(args) {
        const { pageIndex, itemIndex, x, y } = args;

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            `    if (${itemIndex} >= page.allPageItems.length) {`,
            '      "Page item index out of range";',
            '    } else {',
            `      var item = page.allPageItems[${itemIndex}];`,
            `      item.move([${x}, ${y}]);`,
            '      "Page item moved successfully";',
            '    }',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Move Page Item");
    }

    /**
     * Resize a page item
     */
    static async resizePageItem(args) {
        const { pageIndex, itemIndex, width, height, anchorPoint = 'CENTER_ANCHOR' } = args;

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            `    if (${itemIndex} >= page.allPageItems.length) {`,
            '      "Page item index out of range";',
            '    } else {',
            `      var item = page.allPageItems[${itemIndex}];`,
            `      item.resize(ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH, ResizeConstraints.UNCONSTRAINED, [${width}, ${height}], AnchorPoint.${anchorPoint});`,
            '      "Page item resized successfully";',
            '    }',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Resize Page Item");
    }

    /**
     * Set page item properties
     */
    static async setPageItemProperties(args) {
        const { pageIndex, itemIndex, fillColor, strokeColor, strokeWeight, visible, locked } = args;

        const fillColorLiteral = typeof fillColor === 'string' && fillColor !== ''
            ? JSON.stringify(escapeJsxString(fillColor))
            : 'null';
        const strokeColorLiteral = typeof strokeColor === 'string' && strokeColor !== ''
            ? JSON.stringify(escapeJsxString(strokeColor))
            : 'null';
        const strokeWeightLiteral = typeof strokeWeight === 'number' && !Number.isNaN(strokeWeight)
            ? strokeWeight
            : 'null';
        const visibleLiteral = typeof visible === 'boolean' ? visible : 'null';
        const lockedLiteral = typeof locked === 'boolean' ? locked : 'null';

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} < 0 || ${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            `    if (${itemIndex} < 0 || ${itemIndex} >= page.allPageItems.length) {`,
            '      "Page item index out of range";',
            '    } else {',
            `      var item = page.allPageItems[${itemIndex}];`,
            '      try {',
            `        var fillColorName = ${fillColorLiteral};`,
            `        var strokeColorName = ${strokeColorLiteral};`,
            `        var strokeWeightValue = ${strokeWeightLiteral};`,
            `        var visibleSetting = ${visibleLiteral};`,
            `        var lockedSetting = ${lockedLiteral};`,
            '',
            '        if (fillColorName !== null) {',
            '          try {',
            '            var fillSwatch = doc.colors.itemByName(fillColorName);',
            '            if (!fillSwatch || !fillSwatch.isValid) {',
            '              throw new Error("Fill color not found: " + fillColorName);',
            '            }',
            '            item.fillColor = fillSwatch;',
            '          } catch (fillError) {',
            '            throw new Error("Unable to apply fill color: " + fillError.message);',
            '          }',
            '        }',
            '',
            '        if (strokeColorName !== null) {',
            '          try {',
            '            var strokeSwatch = doc.colors.itemByName(strokeColorName);',
            '            if (!strokeSwatch || !strokeSwatch.isValid) {',
            '              throw new Error("Stroke color not found: " + strokeColorName);',
            '            }',
            '            item.strokeColor = strokeSwatch;',
            '          } catch (strokeError) {',
            '            throw new Error("Unable to apply stroke color: " + strokeError.message);',
            '          }',
            '        }',
            '',
            '        if (strokeWeightValue !== null) {',
            '          item.strokeWeight = strokeWeightValue;',
            '        }',
            '',
            '        if (visibleSetting !== null) {',
            '          item.visible = visibleSetting;',
            '        }',
            '',
            '        if (lockedSetting !== null) {',
            '          item.locked = lockedSetting;',
            '        }',
            '',
            '        "Page item properties updated successfully";',
            '      } catch (error) {',
            '        "Error updating page item properties: " + error.message;',
            '      }',
            '    }',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Set Page Item Properties");
    }

    /**
     * Duplicate a page item
     */
    static async duplicatePageItem(args) {
        const { pageIndex, itemIndex, x, y } = args;

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            `    if (${itemIndex} >= page.allPageItems.length) {`,
            '      "Page item index out of range";',
            '    } else {',
            `      var item = page.allPageItems[${itemIndex}];`,
            `      var newItem = item.duplicate();`,
            `      newItem.move([${x}, ${y}]);`,
            '      "Page item duplicated successfully";',
            '    }',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Duplicate Page Item");
    }

    /**
     * Delete a page item
     */
    static async deletePageItem(args) {
        const { pageIndex, itemIndex } = args;

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            `    if (${itemIndex} >= page.allPageItems.length) {`,
            '      "Page item index out of range";',
            '    } else {',
            `      var item = page.allPageItems[${itemIndex}];`,
            '      item.remove();',
            '      "Page item deleted successfully";',
            '    }',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "Delete Page Item");
    }

    /**
     * List all page items on a page
     */
    static async listPageItems(args) {
        const { pageIndex } = args;

        const script = [
            'if (app.documents.length === 0) {',
            '  "No document open";',
            '} else {',
            '  var doc = app.activeDocument;',
            `  if (${pageIndex} >= doc.pages.length) {`,
            '    "Page index out of range";',
            '  } else {',
            `    var page = doc.pages[${pageIndex}];`,
            '    var items = page.allPageItems;',
            '    var result = "=== PAGE ITEMS ===\\n";',
            '',
            '    for (var i = 0; i < items.length; i++) {',
            '      var item = items[i];',
            '      result += "Index: " + i + "\\n";',
            '      result += "Type: " + item.constructor.name + "\\n";',
            '      result += "Name: " + (item.name || "Unnamed") + "\\n";',
            '      result += "ID: " + item.id + "\\n";',
            '      result += "Visible: " + item.visible + "\\n";',
            '      result += "Locked: " + item.locked + "\\n";',
            '      result += "Bounds: " + item.geometricBounds.join(", ") + "\\n";',
            '      result += "---\\n";',
            '    }',
            '',
            '    result;',
            '  }',
            '}'
        ].join('\n');

        const result = await ScriptExecutor.executeInDesignScript(script);
        return formatResponse(result, "List Page Items");
    }
} 