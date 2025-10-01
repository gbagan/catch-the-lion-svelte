<script lang="ts">
  type Props = {
    color?: "red" | "blue" | "green";
    children: () => any;
  }

  let { color="green", children }: Props = $props();
//export Green := (props: {children: string}) => <span class="text-green-500 font-bold">{props.children}
//export Red := (props: {children: string}) => <span class="text-red-500 font-bold">{props.children}
//export Blue := (props: {children: string}) => <span class="text-blue-500 font-bold">{props.children}
</script>

<span class="{color === "green" ? "text-green-500" : color === "red" ? "text-red-500" : "text-blue-500"} font-bold">
  {@render children()}
</span>