import html2pdf from 'jspdf-html2canvas'
import html2canvas from 'html2canvas';

export const exporter = async (html: HTMLElement[], filename: string) => {
    const timpstampe = new Date().getTime();

    await Promise.all(html.map(imageLoader))

    await html2pdf(html,
        {
            jsPDF: { format: 'a4', compress: true, orientation: "portrait" },
            margin: { right: 1, left: 1, top: 1, bottom: 1 },
            autoResize: true,
            output: `${filename}-${timpstampe}.pdf`
        })
}

const imageLoader = async (ele: HTMLElement) => {
    const images = Array.from(ele.querySelectorAll("img"))
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
}

export const export2Img = async (html: HTMLElement, filename: string) => {
    const timpstampe = new Date().getTime();

    await imageLoader(html)

    await html2canvas(html, {
        useCORS: true,
        scale: 2,
    }).then(canvas => {
        const img = canvas.toDataURL('image/jpeg', 1)
        const link = document.createElement('a');
        link.download = `${filename}-${timpstampe}.jpg`;
        link.href = img;
        link.click();
    })
}