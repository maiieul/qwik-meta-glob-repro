import {
  type Component,
  component$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

const metaGlobComponents: any = import.meta.glob("/src/components/*", {
  import: "default",
  eager: false,
});

export default component$<{ name: string }>(({ name }) => {
  const MetaGlobComponent = useSignal<Component<any>>();
  const componentPath = `/src/components/${name}.tsx`;

  useTask$(async () => {
    MetaGlobComponent.value = await metaGlobComponents[componentPath]();
  });

  return <>{MetaGlobComponent.value && <MetaGlobComponent.value />}</>;
});
