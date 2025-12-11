import { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, ImageRun, Table, TableRow, TableCell, BorderStyle, WidthType } from "https://esm.sh/docx@8.5.0";
import { saveAs } from "file-saver";

export const generateSwornDocx = async (
    htmlContent: string,
    clientName: string,
    documentType: string,
    sourceLang: string,
    targetLang: string
) => {
    // Basic HTML to Text parser (very simple for now)
    // In a real app, we would use a proper HTML parser to preserve bold/italic
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textLines = tempDiv.innerText.split('\n');

    const doc = new Document({
        sections: [{
            properties: {},
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "TRADUCTION ASSERMENTÉE / SWORN TRANSLATION",
                                    bold: true,
                                    size: 28,
                                    font: "Times New Roman"
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Ref: ${clientName.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(8)}`,
                                    size: 20,
                                    font: "Times New Roman"
                                }),
                            ],
                            alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({ text: "" }), // Spacer
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Certifié conforme à l'original / Certified true to the original",
                                    bold: true,
                                    size: 24,
                                    font: "Times New Roman"
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Tunis, le ${new Date().toLocaleDateString()}`,
                                    size: 24,
                                    font: "Times New Roman"
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                }),
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Document: ${documentType}`,
                            bold: true,
                            size: 24,
                            font: "Times New Roman"
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Language Pair: ${sourceLang} -> ${targetLang}`,
                            italics: true,
                            size: 24,
                            font: "Times New Roman"
                        }),
                    ],
                    spacing: { after: 400 },
                }),
                // Content
                ...textLines.map(line => {
                    if (!line.trim()) return new Paragraph({ text: "" });
                    return new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: 24, // 12pt
                                font: "Times New Roman"
                            })
                        ],
                        spacing: { after: 120 }
                    });
                })
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${clientName}_${documentType}_SwornTranslation.docx`);
};
