<script lang="ts">
  type Props = { children: () => any }
  let { children }: Props = $props();
//export Green := (props: {children: string}) => <span class="text-green-500 font-bold">{props.children}
//export Red := (props: {children: string}) => <span class="text-red-500 font-bold">{props.children}
//export Blue := (props: {children: string}) => <span class="text-blue-500 font-bold">{props.children}

</script>

<span class="text-green-500 font-bold">{@render children()}</span>