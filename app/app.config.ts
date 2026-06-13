export default defineAppConfig({
  name: 'Mocate Indexer',
  ui: {
    // `ink` = near-black Mocate brand (defined in assets/css/main.css);
    // teal carries the success/accent tone for an editorial, high-contrast look.
    colors: { primary: 'ink', neutral: 'zinc', success: 'teal' },
    input: { defaultVariants: { size: 'xl' } },
    select: { defaultVariants: { size: 'xl' } },
    button: { defaultVariants: { size: 'xl' } },
  },
})
