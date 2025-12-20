/**
 * Export API Route
 *
 * POST /api/export
 *
 * Generates Claude Code configuration files from Stack Builder components.
 * Supports both JSON preview and ZIP download formats.
 *
 * Request body:
 * - components: StackComponent[] - Array of components to export
 * - projectName: string - Name of the project
 * - format?: 'json' | 'zip' - Output format (default: 'json')
 *
 * Response:
 * - JSON format: { files, installCommands, summary }
 * - ZIP format: Binary ZIP file download
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateExport,
  generateZip,
  StackComponent,
} from '@/lib/export-generator';

interface ExportRequest {
  components: StackComponent[];
  projectName?: string;
  format?: 'json' | 'zip';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExportRequest;
    const { components, projectName = 'My Stack', format = 'json' } = body;

    // Validate components array
    if (!components || !Array.isArray(components) || components.length === 0) {
      return NextResponse.json(
        { error: 'Components array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Generate export
    const exportResult = generateExport(components, projectName);

    // Return ZIP format
    if (format === 'zip') {
      const zipBlob = await generateZip(exportResult.files);
      const arrayBuffer = await zipBlob.arrayBuffer();

      // Sanitize project name for filename
      const filename = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename || 'export'}.zip"`,
        },
      });
    }

    // Return JSON format (default)
    return NextResponse.json({
      files: exportResult.files,
      installCommands: exportResult.installCommands,
      summary: {
        fileCount: exportResult.files.length,
        hasCommands: exportResult.files.some((f) =>
          f.path.includes('/commands/')
        ),
        hasMcpConfig: Object.keys(exportResult.mcpConfigs).length > 0,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}
