import Player from './player';

export default class Source extends Player {
  constructor(rootNodeOrSelector, collectionSelector = 'article', itemSelector = 'section') {
    super(rootNodeOrSelector);

    document.addEventListener('selectionchange', this.onSelectionChange.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onSelectionChange() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;

    if (commonAncestor.nodeType === document.TEXT_NODE) {
      range.setStartBefore(commonAncestor.parentNode);
      return;
    }

    if (!(commonAncestor.matches('section[data-src]') || commonAncestor.parentNode.matches('section[data-src]'))) return;

    for (const selected of this.root.querySelectorAll('.selected')) {
      if (selection.containsNode(selected, true) || selection.containsNode(selected.parentNode, true)) continue;
      selected.classList.remove('selected');
      selected.removeAttribute('draggable');
    }

    for (const candidate of commonAncestor.getElementsByTagName('*')) {
      if (selection.containsNode(candidate, true) && candidate.nodeName !== 'P') {
        candidate.classList.add('selected');
      }
    }
  }

  onMouseUp() {
    const selection = window.getSelection();
    const selected = this.root.querySelectorAll('.selected');

    for (const node of selected) {
      if (selection.containsNode(node, true) || selection.containsNode(node.parentNode, true)) {
        node.setAttribute('draggable', true);
        node.addEventListener('dragstart', this.onDragStart.bind(this));
        // node.addEventListener('dragend', this.onDragEnd.bind(this));
      } else {
        // console.log('kill', node);
        node.classList.remove('selected');
        node.removeAttribute('draggable');
      }
    }

    if (selected.length > 0 && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.setStartBefore(selected.item(0));
      range.setEndAfter(selected.item(selected.length - 1));
    } else {
      selection.removeAllRanges();
    }
  }

  onDragStart(event) {
    // event.preventDefault();
    // event.stopPropagation();

    const item = document.createElement('section');
    for (const selected of this.root.querySelectorAll('.selected')) {
      const clone = selected.cloneNode(true);
      clone.classList.remove('selected');
      clone.removeAttribute('draggable');
      item.appendChild(clone);
    }

    event.dataTransfer.setData('html', item.outerHTML);
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.dropEffect = 'copy';

    // return false;
  }

  // onDragEnd() {
  //   for (const node of this.node.querySelectorAll('.selected')) {
  //     node.classList.remove('selected');
  //     node.removeAttribute('draggable');
  //   }
  // }
}
