declare module 'html2pdf.js' {
  function html2pdf(): {
    set(opts: Record<string, unknown>): ReturnType<typeof html2pdf>;
    from(el: HTMLElement): ReturnType<typeof html2pdf>;
    save(): Promise<void>;
    output(type: string): Promise<unknown>;
  };
  export default html2pdf;
}
