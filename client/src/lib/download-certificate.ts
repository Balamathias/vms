"use client";

import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

export async function downloadCertificateFromNode(node: HTMLElement, filename: string) {
  // Render node to PNG at 2x scale for sharpness
  const dataUrl = await htmlToImage.toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    skipAutoScale: false,
    backgroundColor: "#0b0b12",
  });

  // A4 portrait size in jsPDF is 210 x 297 mm => 595 x 842 pt at 72 DPI
  // We'll calculate image dimensions to preserve aspect ratio.
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Create an image to get its natural size
  const img = new Image();
  img.src = dataUrl;
  await new Promise((res) => (img.onload = () => res(null)));

  const imgAspect = img.width / img.height;
  const pageAspect = pageWidth / pageHeight;

  let renderWidth = pageWidth;
  let renderHeight = pageHeight;

  if (imgAspect > pageAspect) {
    // image is wider than page
    renderWidth = pageWidth;
    renderHeight = renderWidth / imgAspect;
  } else {
    renderHeight = pageHeight;
    renderWidth = renderHeight * imgAspect;
  }

  const offsetX = (pageWidth - renderWidth) / 2;
  const offsetY = (pageHeight - renderHeight) / 2;

  pdf.addImage(dataUrl, "PNG", offsetX, offsetY, renderWidth, renderHeight);
  pdf.save(filename);
}
