import { component$, useSignal } from "@builder.io/qwik";

export default component$(() => {
  const count = useSignal(0);
  return (
    <>
      <div>
        <button onClick$={() => count.value++}>increment</button>{" "}
        <span>{count.value}</span>
      </div>
    </>
  );
});
