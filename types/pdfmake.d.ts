declare module 'pdfmake/build/pdfmake' {
  import { TDocumentDefinitions, TCreatedPdf } from 'pdfmake/interfaces';
  
  interface IPdfMake {
    createPdf(documentDefinition: TDocumentDefinitions): TCreatedPdf;
    vfs: any;
  }
  
  const pdfMake: IPdfMake;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  interface IVfsFonts {
    pdfMake: {
      vfs: any;
    };
  }
  
  const vfs_fonts: IVfsFonts;
  export default vfs_fonts;
}
