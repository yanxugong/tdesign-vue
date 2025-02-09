import { CreateElement } from 'vue';
import {
  SetupContext, Ref, onMounted, reactive,
} from '@vue/composition-api';
import { TypeVNode, TypeTreeItemProps } from '../interface';
import { usePrefixClass } from '../../hooks/useConfig';
import { ClassName } from '../../common';
import useLazyLoad from '../../hooks/useLazyLoad';
import useItemEvents from './useItemEvents';
import useRenderIcon from './useRenderIcon';
import useRenderLabel from './useRenderLabel';
import useRenderLine from './useRenderLine';
import useRenderOperations from './useRenderOperations';
import useDraggable from './useDraggable';

export default function useTreeItem(props: TypeTreeItemProps, context: SetupContext, treeItemRef: Ref<HTMLElement>) {
  const { node, treeScope } = props;
  const { virtualConfig, treeContentRef } = treeScope;
  const scrollProps = treeScope?.scrollProps;
  const classPrefix = usePrefixClass().value;
  const componentName = usePrefixClass('tree').value;

  const { handleClick } = useItemEvents(props, context);
  const { renderIcon } = useRenderIcon(props);
  const { renderLabel } = useRenderLabel(props, context);
  const { renderLine } = useRenderLine(props);
  const { renderOperations } = useRenderOperations(props);
  const {
    dragStates, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop,
  } = useDraggable(
    props,
    treeItemRef,
  );

  const { hasLazyLoadHolder, tRowHeight } = useLazyLoad(
    treeContentRef,
    treeItemRef,
    reactive({
      ...scrollProps?.value,
      rowIndex: props.rowIndex,
    }),
  );

  onMounted(() => {
    const isVirtual = virtualConfig?.isVirtualScroll.value;
    if (isVirtual) {
      virtualConfig.handleRowMounted({
        ref: treeItemRef,
        data: node,
      });
    }
  });

  // 节点隐藏用 class 切换，不要写在 js 中
  const getItemStyles = (): string => {
    const { level } = node;
    // 原本想在这里计算 --hscale
    // 实际操作中发现 scrollHeight 在动画执行到一半的时候取得了错误的值
    // 导致 hscale 值获取错误
    // 暂无合适的方案，先搁置 hscale 自动计算策略
    const levelStyle = `--level: ${level};`;
    const strStyle = `${levelStyle}`;
    return strStyle;
  };

  const getItemClassList = (): ClassName => {
    const { isDragOver, isDragging, dropPosition } = dragStates;
    const list = [];
    list.push(`${componentName}__item`);
    list.push({
      [`${componentName}__item--open`]: node.expanded,
      [`${classPrefix}-is-active`]: node.isActivable() ? node.actived : false,
      [`${classPrefix}-is-disabled`]: node.isDisabled(),
    });
    list.push({
      [`${componentName}__item--draggable`]: node.isDraggable(),
    });
    if (node.visible) {
      list.push(`${componentName}__item--visible`);
    } else {
      list.push(`${componentName}__item--hidden`);
    }
    if (node.vmIsLocked) {
      list.push(`${componentName}__item--locked`);
    }
    if (node.vmIsRest) {
      list.push(`${componentName}__item--matched`);
    }
    // 拖拽过程样式相关classList
    list.push({
      [`${componentName}__item--dragging`]: isDragging,
      [`${componentName}__item--tip-top`]: isDragOver && dropPosition < 0,
      [`${componentName}__item--tip-bottom`]: isDragOver && dropPosition > 0,
      [`${componentName}__item--tip-highlight`]: !isDragging && isDragOver && dropPosition === 0,
    });
    return list;
  };

  const renderItem = (h: CreateElement) => {
    const itemNodes: TypeVNode[] = [];

    // 第一步是渲染图标
    const iconNode = renderIcon(h);

    // 渲染连线排在渲染图标之后，是为了确认图标是否存在
    const lineNode = renderLine(h);
    if (lineNode) {
      itemNodes.push(lineNode);
    }

    if (iconNode) {
      itemNodes.push(iconNode);
    }

    const labelNode = renderLabel(h);
    if (labelNode) {
      itemNodes.push(labelNode);
    }

    const opNode = renderOperations(h);
    if (opNode) {
      itemNodes.push(opNode);
    }

    return itemNodes;
  };

  const renderItemNode = (h: CreateElement) => {
    const { level, value } = node;
    const styles = getItemStyles();
    const classList = getItemClassList();

    const itemNode = (
      <div
        ref="treeItemRef"
        class={classList}
        data-value={value}
        data-level={level}
        style={styles}
        onClick={(evt: MouseEvent) => handleClick(evt)}
        draggable={node.isDraggable()}
        onDragstart={(evt: DragEvent) => handleDragStart(evt)}
        onDragend={(evt: DragEvent) => handleDragEnd(evt)}
        onDragover={(evt: DragEvent) => handleDragOver(evt)}
        onDragleave={(evt: DragEvent) => handleDragLeave(evt)}
        onDrop={(evt: DragEvent) => handleDrop(evt)}
      >
        {hasLazyLoadHolder.value ? [<div />] : renderItem(h)}
      </div>
    );
    return itemNode;
  };

  return {
    hasLazyLoadHolder,
    tRowHeight,
    renderItemNode,
  };
}
