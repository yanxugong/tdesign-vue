<template>
  <t-space :size="20" direction="vertical">
    <div>
      <h3>render:</h3>
      <t-tree :data="items" hover expand-all :load="load" :icon="icon" />
    </div>
    <div>
      <h3>scope slot:</h3>
      <t-tree :data="items" hover lazy :load="load">
        <template #icon="{ node }">
          <icon v-if="node.getChildren() && !node.expanded" name="caret-right" />
          <icon v-else-if="node.getChildren() && node.expanded && node.loading" name="loading" />
          <icon v-else-if="node.getChildren() && node.expanded" name="caret-down" />
          <icon v-else name="attach" />
        </template>
      </t-tree>
    </div>
  </t-space>
</template>

<script lang="jsx">
import { Icon } from 'tdesign-icons-vue';

export default {
  components: {
    Icon,
  },
  data() {
    return {
      items: [
        {
          label: '1',
          children: true,
        },
        {
          label: '2',
          children: true,
        },
      ],
    };
  },
  methods: {
    icon(createElement, node) {
      let name = 'file';
      if (node.getChildren()) {
        if (node.expanded) {
          name = 'folder-open';
          if (node.loading) {
            name = 'loading';
          }
        } else {
          name = 'folder';
        }
      }
      return <Icon name={name} />;
    },
    load(node) {
      const maxLevel = 2;
      return new Promise((resolve) => {
        setTimeout(() => {
          let nodes = [];
          if (node.level < maxLevel) {
            nodes = [
              {
                label: `${node.label}.1`,
                children: node.level < maxLevel - 1,
              },
              {
                label: `${node.label}.2`,
                children: node.level < maxLevel - 1,
              },
            ];
          }
          resolve(nodes);
        }, 500);
      });
    },
  },
};
</script>

<style scoped>
.tdesign-tree-demo .t-tree {
  margin-bottom: 20px;
}
.tdesign-tree-demo .title {
  margin-bottom: 10px;
}
.tdesign-tree-demo .tips {
  margin-bottom: 10px;
}
.tdesign-tree-demo .operations {
  margin-bottom: 10px;
}
.tdesign-tree-demo .t-form__item {
  margin-bottom: 5px;
}
</style>
