import { IPDFJsFunctionality, IXLSXFunctionality } from '../types/index.type'

export const loadXlsx = async (): Promise<IXLSXFunctionality> => {
    const lib = await import('xlsx')
    return {
        writeFile: lib.writeFile,
        utils: lib.utils
    }
}

export const loadPDF = async (): Promise<IPDFJsFunctionality> => {
    const [html2pdf, html2canvas] = await Promise.all([
        import('jspdf-html2canvas'),
        import('html2canvas')
    ])
    return {
        toPDF: html2pdf.default,
        toImg: html2canvas.default
    }
}