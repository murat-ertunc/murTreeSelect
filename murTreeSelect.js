// Options
// targetElementId: ID of the target element where the component will be rendered
// mode: singleSelect, multiSelect, tree, singleSelectableTree, multiSelectableTree
// openAll: true, false
// noDataIcon: true, false
// searchInput: true, false
// inputName: input name
// checkedValues: data to be selected when tree is rendered
// disabledValues: data to be disabled when tree is rendered
// notShowDsbldCheckbox: if notShowDsbldCheckbox is true, disabled checkboxes are not shown
// getValues: if getValues is onlyChecked, only checked values are returned. if withChildren, checked values and their children are returned. if withCheckedChildren, checked values and their children are returned and checked values are returned with children
// placeHolder: placeholder text
// lang: 'tr', 'en', 'ar', 'de', 'uz-ki', 'uz-la', 'ru'
// show: {functionName: '', dataColumn: []}, if show is not null, show button is rendered, when clicked, show.functionName is called with dataColumn
// edit: {functionName: '', dataColumn: []}, if edit is not null, edit button is rendered, when clicked, edit.functionName is called with dataColumn
// delete: {functionName: '', dataColumn: []}, if delete is not null, delete button is rendered, when clicked, delete.functionName is called with dataColumn
// dataRequest: {url: '', method: '', data: {}}
// columnDefs: {id: '', name: '', dataType: '', dataConnection: ''}
// if dataType is allTogether, data parent is dataConnection. if dataType is intertwined, data are connected to each other by dataConnection and dataConnection should be array
// onSelect: function(data){}
// You can use the isNull method to check whether data has been selected or not (console.log(MurTreeInstance.isNull()); // returns true or false)
// You can use the isInvalid method to check whether data has been selected or not (console.log(MurTreeInstance.isInvalid()); // returns true or false)
// You can use the changeInvalidState method to check whether data has been selected or not (MurTreeInstance.changeInvalidState(true); // true or false)
// You can use the reload method to reload the data (MurTreeInstance.reload();)
// You can use the getSelectedValues method to get the selected data (console.log(MurTreeInstance.getSelectedValues());)
// The responseFilter function provides data from the response and expects a function. Based on this function, it filters the data and disables certain items

// Example Usage
// const MurTreeInstance = new MurTree({
//     targetElementId: 'targetElementIdMustBeUnique',
//     mode: "singleSelect",
//     openAll: false,
//     noDataIcon: false,
//     searchInput: false,
//     inputName: "targetDivNameMustBeUnique",
//     checkedValues: [],
//     disabledValues: [],
//     notShowDsbldCheckbox: false,
//     getValues: 'onlyChecked',
//     lang: 'tr',
//     placeHolder: 'Lütfen Seçiniz',
//     show: {
//         functionName: 'showFunc',
//         dataColumn: ['id', 'name']
//     },
//     edit: {
//         functionName: 'exampleEditFunction',
//         dataColumn: ['id']
//     },
//     delete: {
//         functionName: 'exampleEditFunction',
//         dataColumn: ['id']
//     },
//     dataRequest: {
//         url: "/request-url",
//         method: "POST",
//         data: {
//             some: data
//         }
//     },
//     columnDefs: {
//         id: 'id',
//         name: ['name', 'second_name'],
//         dataType: 'intertwined',
//         dataConnection: 'place_childrens',
//     },
//     onSelected: function(selectedVals){
//         console.log(selectedVals);
//     },
//     unSelected: function(currentValues){
//         console.log(currentValues);
//     },
//     responseFilter: function(responseData){
//         return responseData.filter(x => x.id != 1);
//     }
// });

class MurTree {

  constructor(confs) {
      this.targetElementId = confs.targetElementId ?? alert('targetElementId is required');
      this.mode = confs.mode ?? 'singleSelect';
      this.openAll = confs.openAll ?? false;
      this.noDataIcon = confs.noDataIcon ?? false;
      this.searchInput = confs.searchInput ?? true;
      this.inputName = confs.inputName ?? alert('inputName is required');
      this.checkedValues = confs.checkedValues ?? [];
      this.disabledValues = confs.disabledValues ?? [];
      this.notShowDsbldCheckbox = confs.notShowDsbldCheckbox ?? false;
      this.getValues = confs.getValues ?? 'onlyChecked';
      this.lang = confs.lang ?? 'tr';
      this.placeHolder = confs.placeHolder ?? this.getTrans('pls_select');
      this.show = confs.show ?? null;
      this.edit = confs.edit ?? null;
      this.delete = confs.delete ?? null;
      this.dataRequest = confs.dataRequest ?? alert('dataRequest is required');
      this.columnDefs = confs.columnDefs ?? alert('columnDefs is required');
      this.onSelected = confs.onSelected ?? function (data) { };
      this.unSelected = confs.unSelected ?? function (data) { };
      this.uniqueId = Math.floor(Math.random() * 1000000);
      this.invalid = false;
      this.datas = [];
      this.selectedValues = [];
      this.ids = [];
      this.responseFilter = confs.responseFilter ?? function(data){ return data; };

      if (!confs.targetElementId || !confs.inputName || !confs.dataRequest || !confs.columnDefs) {
          return;
      }

      this.init();
  }

  async init() {
      const self = this;
      const targetDiv = document.getElementById(self.targetElementId);
      targetDiv.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="height: 2.714rem;"><i class="fas fa-spinner fa-spin"></i></div>`;
      self.datas = await self.getData();

      self.modeRender();
      if (self.mode == 'singleSelect' || self.mode == 'singleSelectableTree') {
          targetDiv.innerHTML += `<input type="hidden" name="${self.inputName}" id="${self.inputName}${self.uniqueId}" value="">`;
      } else {
          targetDiv.innerHTML += `<span id="input-span-${self.inputName}${self.uniqueId}" style="display:none;"></span>`;
      }

      document.addEventListener('click', self.treeIconClickListener = function (event) {
          if (event.target.classList.contains(`tree-icon${self.uniqueId}`)) {
              self.showTreeChildren(event.target.getAttribute('data-id'));
          }
      });

      if(self.searchInput){
        searchEvents();
      }

      if (self.mode != 'tree') {
          self.checkBoxListener();
      }

      for (let checkedVls = 0; checkedVls < self.checkedValues.length; checkedVls++) {
          if(document.getElementById(`checkbox-${this.uniqueId}-` + self.checkedValues[checkedVls])){
              document.getElementById(`checkbox-${this.uniqueId}-` + self.checkedValues[checkedVls]).checked = true;
              document.getElementById(`checkbox-${this.uniqueId}-` + self.checkedValues[checkedVls]).dispatchEvent(new Event('change'));
          }
      }

      self.disabledValuesControl();
  }

  async getData() {
      try {
          const response = await fetch(this.dataRequest.url, {
              method: this.dataRequest.method,
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(this.dataRequest.data)
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          this.datas = data;
          return data;
      } catch (error) {
          console.error('Fetch error:', error);
          throw error;
      }
  }

  modeRender() {
    const self = this;
    const targetDiv = document.getElementById(self.targetElementId);
    if (self.mode == 'singleSelect' || self.mode == 'multiSelect') {
      targetDiv.innerHTML = self.renderSelectHtml();

      document.getElementById(`selectDiv${self.uniqueId}`).addEventListener('click', function (event) {
          self.changeDisplayTree();
      });

      document.addEventListener('click', self.globalClickListener = function (event) {
          let selectDivClosest = event.target.closest(`#selectDiv${self.uniqueId}`);
          let treeDivClosest = event.target.closest(`#treeDiv${self.uniqueId}`);
          let treeDiv = document.getElementById(`treeDiv${self.uniqueId}`);

          if(treeDiv != null){
              if (selectDivClosest == null && treeDivClosest == null) {
                  treeDiv.style.display = 'none';
              } else if (selectDivClosest != null) {
                  if (treeDiv.style.display == 'none') {
                      treeDiv.style.display = 'block';
                  } else {
                      treeDiv.style.display = 'none';
                  }
              } else {
                  treeDiv.style.display = 'block';
              }
          }
      });
    } else if (self.mode == 'tree' || self.mode == 'singleSelectableTree' || self.mode == 'multiSelectableTree') {
        targetDiv.innerHTML = self.renderTreeHtml();
    }
  }

  searchEvents() {
    const self = this;

    document.addEventListener('keyup', function (event) {
      if (event.target.id == `tree-search-input${self.uniqueId}`) {
          let searchValue = event.target.value.toLowerCase();

          if(searchValue == null || searchValue == ''){
              for (let index = 0; index < self.datas.length; index++) {
                  const element = self.datas[index];
                  document.getElementById(`treeDivInner${self.uniqueId}-${element[self.columnDefs.id]}`).style.display = 'flex';

                  if(element[self.columnDefs.dataConnection] != null){
                      let childrens = element[self.columnDefs.dataConnection];
                      for (let index = 0; index < childrens.length; index++) {
                          const child = childrens[index];
                          document.getElementById(`treeDivInner${self.uniqueId}-${child}`).style.display = 'flex';
                      }
                  }
              }
              return;
          }

          if(searchValue.length < 3){
              return;
          }

          for (let index = 0; index < self.datas.length; index++) {
              const element = self.datas[index];
              if(element[self.columnDefs.name].toLowerCase().includes(searchValue)){
                  document.getElementById(`treeDivInner${self.uniqueId}-${element[self.columnDefs.id]}`).style.display = 'flex';
                  element.dataShowed = true;
              }else{
                  document.getElementById(`treeDivInner${self.uniqueId}-${element[self.columnDefs.id]}`).style.display = 'none';
                  element.dataShowed = false;
              }
          }

          for (let index = 0; index < self.datas.length; index++) {
              const element = self.datas[index];
              if(!element.dataShowed){
                  continue;
              }

              let thisElement = document.getElementById(`treeDivInner${self.uniqueId}-${element[self.columnDefs.id]}`);
              self.showParent(thisElement.getAttribute('data-connection-no'));
          }
      }
    });
  }

  disabledValuesControl() {
    const self = this;

    if(typeof responseFilter != "function"){
        self.responseFilter = function(data){ return []; };
    }

    self.disabledValues = [...new Set(
        self.disabledValues.concat(
            self.responseFilter(self.datas).map(x => x[self.columnDefs.id])
        )
    )];

    for (let disabledVls = 0; disabledVls < self.disabledValues.length; disabledVls++) {
        if(document.getElementById(`checkbox-${this.uniqueId}-` + self.disabledValues[disabledVls])){
            if(self.notShowDsbldCheckbox){
                document.getElementById(`checkbox-${this.uniqueId}-` + self.disabledValues[disabledVls]).remove();
            }else{
                document.getElementById(`checkbox-${this.uniqueId}-` + self.disabledValues[disabledVls]).disabled = true;
            }
        }
    }
  }

  showParent(parentId) {
      if(parentId == null || parentId == '' || parentId == 'null'){
          return;
      }
      let parent = document.getElementById(`treeDivInner${this.uniqueId}-${parentId}`);
      parent.style.display = 'flex';
      let parentParentNo = parent.getAttribute('data-connection-no');
      if (parentParentNo == null || parentParentNo == '' || parentParentNo == 'null') {
          return;
      }
      this.showParent(parentParentNo);
  }

  renderSelectHtml() {
      return `
      <div class="w-100 position-relative">
          <div class="select-div" id="selectDiv${this.uniqueId}">
              <span id="selectedValuesText${this.uniqueId}">${this.placeHolder}</span>
              <span><i class="fas fa-caret-down"></i></span>
          </div>

          ${this.renderTreeHtml()}
      </div>
      `;
  }

  renderTreeHtml() {
      return `
          <div class="tree-div ${this.searchInput ? 'pt-0' : ''}" id="treeDiv${this.uniqueId}" ${this.mode == 'singleSelect' || this.mode == 'multiSelect' ? `style="position: absolute; display: none;"` : ``}>
              ${this.renderSelectTreeHtml()}
          </div>
      `;
  }

  renderSelectTreeHtml() {
      let treeHtml = '';

      if (this.datas.length == 0) {
          return `<div class="tree-div-item">${this.getTrans('no_data')}</div>`;
      }

      if(this.searchInput){
          treeHtml = this.renderSearchInput();
      }

      for (let index = 0; index < this.datas.length; index++) {
          const element = this.datas[index];

          if (this.columnDefs.dataType == 'allTogether') {
              if (element[this.columnDefs.dataConnection] != null) {
                  continue;
              }
          }
          treeHtml += this.renderInnerHtml(element, null);
      }

      return treeHtml;
  }

  renderSearchInput() {
      return `
          <div class="tree-div-item top-search-input-div">
              <input type="text" class="form-control" placeholder="${this.getTrans('search')}" id="tree-search-input${this.uniqueId}">
          </div>
      `;
  }

  renderSelectTreeHtmlChilds(connection, parentId) {
      let treeDatas = [];

      if (this.columnDefs.dataType == 'allTogether') {
          for (let index = 0; index < this.datas.length; index++) {
              const element = this.datas[index];
              if (element[this.columnDefs.dataConnection] == connection) {
                  treeDatas.push(element);
              }
          }
      } else {
          treeDatas = connection;
      }

      if (treeDatas == null || treeDatas.length == 0) {
          return '';
      }

      let treeHtml = '';

      for (let index = 0; index < treeDatas.length; index++) {
          const element = treeDatas[index];
          treeHtml += this.renderInnerHtml(element, parentId);
      }

      return treeHtml;
  }

  renderInnerHtml(data, parentId) {
      let name = data[this.columnDefs.name];
      if(Array.isArray(this.columnDefs.name)){
          name = '';
          for (let index = 0; index < this.columnDefs.name.length; index++) {
              const element = this.columnDefs.name[index];
              if(data[element] == null || data[element] == ''){
                  continue;
              }
              if(index != 0){
                  name += ' | ';
              }
              name += data[element] ?? '';
          }
          data[this.columnDefs.name] = name;
      }

      return `
          <div class="tree-div-item" id="treeDivInner${this.uniqueId}-${data[this.columnDefs.id]}" data-connection-no="${parentId}">
              <div class="tree-icon-div">
                  ${
                      !this.haveChildren(data) ? this.noDataIcon ? '<img src="/icons/tree-no-content.svg" width="23" height="23">' : `` : this.openAll ? `<img src="/icons/tree-open-folder.svg" class="tree-icon${this.uniqueId}" width="23" height="23" data-id="${this.uniqueId}-${data[this.columnDefs.id]}" data-status="open">` : `<img src="/icons/tree-folder.svg" class="tree-icon${this.uniqueId}" width="23" height="23" data-id="${this.uniqueId}-${data[this.columnDefs.id]}" data-status="close">`
                  }
              </div>
              <div class="tree-input-div">
                  ${this.mode != 'tree' ? `<input id="checkbox-${this.uniqueId}-${data[this.columnDefs.id]}" type="checkbox" class="tree-checkbox" value="${data[this.columnDefs.id]}" data-name="${name}">` : ``}
                  <label>${name}</label>
              </div>
              ${this.show != null || this.edit != null || this.delete != null ?
                  `<div class="tree-crud-div">
                      ${this.show != null ? `<img src="/icons/tree-show.svg" width="23" height="23" class="tree-crud-icon" onclick="${this.show.functionName}(${this.show.dataColumn.map(column => `'${data[column]}'`).join(',')})">` : ''}
                      ${this.edit != null ? `<img src="/icons/tree-edit.svg" width="23" height="23" class="tree-crud-icon" onclick="${this.edit.functionName}(${this.edit.dataColumn.map(column => `'${data[column]}'`).join(',')})">` : ''}
                      ${this.delete != null ? `<img src="/icons/tree-trash.svg" width="23" height="23" class="tree-crud-icon" onclick="${this.delete.functionName}(${this.delete.dataColumn.map(column => `'${data[column]}'`).join(',')})">` : ''}
                  </div>`
                  :
                  ''
              }
          </div>
          <div class="tree-child-div ${this.openAll ? '' : `d-none`}" id="childrensDiv-${this.uniqueId}-${data[this.columnDefs.id]}">
              ${this.columnDefs.dataType == 'allTogether' ? this.renderSelectTreeHtmlChilds(data[this.columnDefs.id], data[this.columnDefs.id]) : this.renderSelectTreeHtmlChilds(data[this.columnDefs.dataConnection], data[this.columnDefs.id])}
          </div>
      `;
  }

  showTreeChildren(id) {
      let childrensDiv = document.getElementById('childrensDiv-' + id);
      let treeIcon = document.querySelector(`img[data-id="${id}"]`);

      if (treeIcon.getAttribute('data-status') == 'close') {
          treeIcon.src = '/icons/tree-open-folder.svg';
          treeIcon.setAttribute('data-status', 'open');
          childrensDiv.classList.remove('d-none');
      } else {
          treeIcon.src = '/icons/tree-folder.svg';
          treeIcon.setAttribute('data-status', 'close');
          childrensDiv.classList.add('d-none');
      }
  }

  haveChildren(data) {
      const self = this;
      let dataChields = null;

      if (self.columnDefs.dataType == 'allTogether') {
          dataChields = self.datas.filter(function (item) {
              return item[self.columnDefs.dataConnection] == data[self.columnDefs.id];
          });
      } else {
          dataChields = data[self.columnDefs.dataConnection];
      }

      if(dataChields === undefined){
          dataChields = [];
      }


      return dataChields.length > 0;
  }

  changeDisplayTree() {
      let treeDiv = document.getElementById(`treeDiv${this.uniqueId}`);

      if (treeDiv.style.display == 'none') {
          treeDiv.style.display = 'block';
      } else {
          treeDiv.style.display = 'none';
      }
  }

  attachCheckboxEvents(element) {
      const checkboxes = document.querySelectorAll(`#${this.targetElementId} .tree-checkbox`);
      const { mode, getValues, datas, columnDefs, inputName, uniqueId } = this;

      const updateSelectedValues = (id, data) => {
          if (element.checked) {
              this.selectedValues.push(data);
          } else {
              this.selectedValues = this.selectedValues.filter(item => item.id != id);
          }
      };

      if (mode == 'singleSelect' || mode == 'singleSelectableTree') {
          checkboxes.forEach(checkbox => {
              if (checkbox != element) {
                  checkbox.checked = false;
                  this.selectedValues = this.selectedValues.filter(item => item.id != checkbox.value);
              }
          });
      }

      let item;

      if(columnDefs.dataType == 'intertwined'){
          item = this.interWinedFinder(datas, columnDefs.id, element.value);
      }else{
          item = datas.find(x => x[columnDefs.id] == element.value);
      }

      switch (getValues) {
          case 'onlyChecked':
              updateSelectedValues(element.value, item);
              break;
          case 'withChildren':
              let willPushData = item;
              willPushData.children = this.getAllChildrens(element.value, 'all');
              updateSelectedValues(element.value, willPushData);
              break;
          case 'withCheckedChildren':
              this.ids = [];
              const childrenIds = this.getAllChildrens(element.value, 'onlyId');
              if (element.checked) {
                  childrenIds.forEach(id => {
                      const childElement = document.getElementById(`checkbox-${this.uniqueId}-${id}`);
                      if (childElement && childElement.checked) {
                          childElement.checked = false;
                          this.selectedValues = this.selectedValues.filter(item => item.id != childElement.value);
                      }
                  });
                  updateSelectedValues(element.value, item);
                  childrenIds.forEach(id => document.getElementById(`checkbox-${this.uniqueId}-${id}`).checked = true);
              } else {
                  this.selectedValues = this.selectedValues.filter(item => item.id != element.value);
                  childrenIds.forEach(id => {
                      const childElement = document.getElementById(`checkbox-${this.uniqueId}-${id}`);
                      if (childElement && childElement.checked) {
                          childElement.checked = false;
                          this.selectedValues = this.selectedValues.filter(item => item.id != childElement.value);
                      }
                  });
              }
              break;
      }

      if (element.checked) {
          if (mode == 'singleSelect' || mode == 'singleSelectableTree') {
              document.getElementById(inputName + uniqueId).value = element.value;
          } else {
              document.getElementById(`input-span-${inputName}${uniqueId}`).innerHTML += `<input type="hidden" id="${inputName}${uniqueId}-${element.value}" name="${inputName}[]" value="${element.value}">`;
          }
      } else {
          if (mode == 'singleSelect' || mode == 'singleSelectableTree') {
              document.getElementById(inputName + uniqueId).value = '';
          } else {
              document.getElementById(`${inputName}${uniqueId}-${element.value}`).remove();
          }
      }

      if (mode == 'multiSelect' || mode == 'multiSelectableTree') {
          if (element.checked) {
              document.getElementById(`input-span-${inputName}${uniqueId}`).innerHTML += `<input type="hidden" id="${inputName}${uniqueId}-${element.value}" name="${inputName}[]" value="${element.value}">`;
          } else {
              document.getElementById(`${inputName}${uniqueId}-${element.value}`).remove();
          }
      } else {
          document.getElementById(inputName + uniqueId).value = element.value;
      }

      if (mode == 'singleSelect' || mode == 'multiSelect') {
          let selectedValuesText = this.selectedValues.map(value => value.name).join(', ') || this.placeHolder;
          document.getElementById(`selectedValuesText${this.uniqueId}`).innerHTML = selectedValuesText;
      }

      this.onSelected(this.selectedValues);
  }

  interWinedFinder(filterData, dataDefination, willSearch) {
      let result = [];

      result = filterData.find(x => x[dataDefination] == willSearch);
      if(result){
          return result;
      }

      for (let index = 0; index < filterData.length; index++) {
          const element = filterData[index];
          if(!element[this.columnDefs.dataConnection] || element[this.columnDefs.dataConnection].length == 0){
              continue;
          }
          result = this.interWinedFinder(element[this.columnDefs.dataConnection], dataDefination, willSearch);
          if(result != null && result != undefined){
              return result;
          }
      }

      return result;
  }

  checkBoxListener() {
      const checkboxes = document.querySelectorAll('#' + this.targetElementId + ' .tree-checkbox');
      checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', (event) => {
              this.attachCheckboxEvents(event.target);
          });
      });
  }

  getAllChildrens(id, type) {
      const self = this;

      if (type == 'all') {
          if (self.columnDefs.dataType == 'intertwined') {
              let data;
              if(self.columnDefs.dataType == 'intertwined'){
                  data = this.interWinedFinder(self.datas, self.columnDefs.id, id);
              }else{
                  data = self.datas.find(x => x[self.columnDefs.id] == id);
              }


              for (let index = 0; index < data[self.columnDefs.dataConnection].length; index++) {
                  const element = data[self.columnDefs.dataConnection][index];
                  self.getAllChildrens(element, 'all');
              }

              return data[self.columnDefs.dataConnection];
          } else {
              let childrens = self.datas.filter(function (item) {
                  return item[self.columnDefs.dataConnection] == id;
              });

              if (childrens.length > 0) {
                  childrens.forEach(child => {
                      self.getAllChildrens(child[self.columnDefs.id], 'all');
                  });
              }

              return childrens;
          }
      } else if (type == 'onlyId') {
          if (self.columnDefs.dataType == 'intertwined') {
              let data = self.datas.filter(item => item[self.columnDefs.id] == id)[0];

              for (let index = 0; index < data[self.columnDefs.dataConnection].length; index++) {
                  const element = data[self.columnDefs.dataConnection][index];
                  self.getAllChildrens(element, 'onlyId');
              }

              return self.ids;
          } else {
              let childrens = self.datas.filter(function (item) {
                  return item[self.columnDefs.dataConnection] == id;
              });

              if (childrens.length > 0) {
                  childrens.forEach(child => {
                      if (!self.ids.includes(child[self.columnDefs.id])) {
                          self.ids.push(child[self.columnDefs.id]);
                      }
                      self.getAllChildrens(child[self.columnDefs.id], 'onlyId');
                  });
              }

              return self.ids;
          }
      }
  }

  isNull() {
      return this.selectedValues.length == 0;
  }

  isInvalid() {
      return this.invalid;
  }

  getSelectedValues() {
      return this.selectedValues;
  }

  selectValue(value) {
      if(!Array.isArray(value)){
          value = [value];
      }

      if(this.getSelectedValues().filter(item => item.id == value).length > 0){
          return;
      }

      for (let i = 0; i < value.length; i++) {
          if(document.getElementById(`checkbox-${this.uniqueId}-` + value[i])){
              document.getElementById(`checkbox-${this.uniqueId}-` + value[i]).checked = true;
              document.getElementById(`checkbox-${this.uniqueId}-` + value[i]).dispatchEvent(new Event('change'));
          }
      }
  }

  unSelectValue(value) {
      if(!Array.isArray(value)){
          value = [value];
      }

      for (let i = 0; i < value.length; i++) {
          if(document.getElementById(`checkbox-${this.uniqueId}-` + value[i])){
              document.getElementById(`checkbox-${this.uniqueId}-` + value[i]).checked = false;
              document.getElementById(`checkbox-${this.uniqueId}-` + value[i]).dispatchEvent(new Event('change'));
          }
      }
  }

  disableValue(value) {
      if(!Array.isArray(value)){
          value = [value];
      }

      for (let i = 0; i < value.length; i++) {
          document.getElementById(`checkbox-${this.uniqueId}-` + value[i]).disabled = true;
      }
  }

  changeInvalidState(isInvalid) {
      this.invalid = isInvalid;
      if (this.mode == 'singleSelect' || this.mode == 'multiSelect') {
          const selectDiv = document.getElementById(`selectDiv${this.uniqueId}`);

          if (isInvalid) {
              selectDiv.classList.add('is-invalid');
          } else {
              selectDiv.classList.remove('is-invalid');
          }
      }else{
          const treeDiv = document.getElementById(`treeDiv${this.uniqueId}`);

          if (isInvalid) {
              treeDiv.classList.add('is-invalid');
          } else {
              treeDiv.classList.remove('is-invalid');
          }
      }
  }

  getTrans(key) {
      const translations = {
          'tr': {
              pls_select: 'Lütfen Seçiniz',
              no_data: 'Veri Bulunamadı',
              search: 'Ara',
          },
          'en': {
              pls_select: 'Please Select',
              no_data: 'No Data',
              search: 'Search',
          },
          'ar': {
              pls_select: 'الرجاء الاختيار',
              no_data: 'لا توجد بيانات',
              search: 'بحث',
          },
          'de': {
              pls_select: 'Bitte auswählen',
              no_data: 'Keine Daten',
              search: 'Suche',
          },
          'uz_ki': {
              pls_select: 'Iltimos, tanlang',
              no_data: 'Ma\'lumotlar topilmadi',
              search: 'Qidirish',
          },
          'uz_la': {
              pls_select: 'Iltimos, tanlang',
              no_data: 'Ma\'lumotlar topilmadi',
              search: 'Qidirish',
          },
          'ru': {
              pls_select: 'Пожалуйста, выберите',
              no_data: 'Данные не найдены',
              search: 'Поиск',
          },
      };

      return translations[this.lang][key] || key;
  }

  reload() {
      document.removeEventListener('click', this.globalClickListener);
      document.removeEventListener('click', this.treeIconClickListener);

      const targetDiv = document.getElementById(this.targetElementId);
      targetDiv.innerHTML = '';

      this.datas = [];
      this.selectedValues = [];
      this.ids = [];
      this.invalid = false;

      this.init();
  }
}
