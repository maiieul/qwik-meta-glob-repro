import {
  type Component,
  component$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { isDev } from "@builder.io/qwik/build";

const metaGlobComponents: any = import.meta.glob("/src/components/*", {
  import: "default",
  eager: false,
});

export default component$<{ name: string }>(({ name }) => {
  const MetaGlobComponent = useSignal<Component<any>>();
  const componentPath = `/src/components/${name}.tsx`;

  useTask$(async () => {
    if (isDev) {
      MetaGlobComponent.value = await metaGlobComponents[componentPath]();
    } else {
      MetaGlobComponent.value = metaGlobComponents[componentPath];
    }
  });

  return <>{MetaGlobComponent.value && <MetaGlobComponent.value />}</>;
});
