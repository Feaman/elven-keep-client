import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  // Register all the components
  const componentsFolderFiles: any = import.meta.globEager('../components/**/*.vue');
  Object.keys(componentsFolderFiles).forEach((key: string) => {
    const part: string | undefined = key.split('/').pop();
    if (part) {
      app.component(part.split('.')[0], componentsFolderFiles[key].default);
    }
  });
});
