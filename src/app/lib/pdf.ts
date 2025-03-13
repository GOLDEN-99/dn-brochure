import html2pdf from 'jspdf-html2canvas'

export const exporter = async (html: HTMLElement) => {
    const timpstampe = new Date().getTime();
    await html2pdf(html, { jsPDF: { format: 'a4', compress: true }, autoResize: true, output: `${timpstampe}.pdf` })
}