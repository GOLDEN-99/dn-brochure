import html2pdf from 'jspdf-html2canvas'

export const exporter = async (html: HTMLElement) => {
    const timpstampe = new Date().getTime();

    const images = Array.from(html.querySelectorAll('img'));
    const imagePromises = await Promise.all(images.map(async (img) => {
        if (!img.src.startsWith('http')) return null;

        try {
            const response = await fetch(img.src);
            const blob = await response.blob();

            return new Promise<void>(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    img.src = reader.result as string;
                    resolve();
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Failed to load image:', img.src, error);
            return null;
        }
    }));
    await Promise.all(imagePromises.filter(promise => promise !== null));

    await html2pdf(html, { jsPDF: { format: 'a4', compress: true }, autoResize: true, output: `${timpstampe}.pdf` })
}