import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Bordereau } from '../import-wizard/bordereau/bordereau.model';
import { AppSharedService } from '../../services/app-shared/app-shared.service';
import { GridFromExcelService } from './grid-from-excel.service';
import { GridOptions, GridApi, IGetRowsParams, ExcelExportParams } from 'ag-grid-community';
import { FormControl } from '@angular/forms';
import { GridOverlayComponent } from '../base/ag-grid-base/ag-grid-components/grid-overlay/grid-overlay.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-grid-from-excel',
  templateUrl: './grid-from-excel.component.html',
  styleUrls: ['./grid-from-excel.component.css']
})
export class GridFromExcelComponent implements OnInit {

  frameworkComponents: {};
  @Input()
  rowData: any;
  @Input()
  columnDefs: any;
  @Input()
  gridOptions: GridOptions;
  @Input()
  secondaryGridOptionsParam: any;
  @Input()
  gridParamters: any;
  @Input()
  headerHeight: any;
  @Input()
  agGridRowHeight: number = 37;
  @Input()
  pagination: boolean = false;
  @Input()
  paginationAutoPageSize: boolean = false;
  @Output()
  agGridRowSelected: any = new EventEmitter<any>();
  @Output()
  rowEditComplete: any = new EventEmitter<any>();
  @Output()
  gridReadyComplete: any = new EventEmitter<any>();
  @Output()
  rowDataChanged: any = new EventEmitter<any>();
  @Input()
  rowDeselection: boolean = false;
  @Input()
  enableSorting: boolean = true;
  @Input()
  suppressRowClickSelection: boolean = false;
  @Input()
  enableServerSideFilter: boolean = false;
  @Input()
  enableServerSideSorting: boolean = false;
  @Input()
  pinnedBottomRowData: any;

  gridColumnApi: any;
  gridApi: GridApi;

  components: {};
  @Input()
  rowSelection = 'single'; // single|multiple

  rowBuffer: number;
  @Input()
  rowModelType: string = ''; // normal|infinite
  paginationPageSize: number;
  cacheOverflowSize: number;
  maxConcurrentDatasourceRequests: number;
  infiniteInitialRowCount: number;
  maxBlocksInCache: number;

  @Input()
  editType: string = '';
  @Input()
  updateDashboard: boolean = undefined;

  @Input()
  globalFilter: string = '';
  globalSearchControl = new FormControl();
  @Input()
  showGlobalSearch: boolean = false;
  @Input()
  showExportButton: boolean = true;

  overlayLoadingTemplate: any;
  gridOverlayComponentParams: { loadingMessage: string };
  fileName = ''

  @Input()
  getContextMenuItems: any = undefined;
  @Input()
  gridParent: any;

  @Output()
  newColumnsLoaded: any = new EventEmitter<any>();
  getRowStyle: any;
  // columnDefs = MockData.agGridColumnDefs_NameMatching;
  // rowData = MockData.agGridRowData_NameMatching;
  bordereauModel: Bordereau;
  constructor(public appSharedService: AppSharedService, public gridFromExcelService: GridFromExcelService) { }

  ngOnInit() {
    this.bordereauModel = this.appSharedService.bordereauModel;
    console.log(this.bordereauModel);
    this.frameworkComponents = {
      GridOverlayComponent: GridOverlayComponent
    };
    this.gridOverlayComponentParams = { loadingMessage: 'One moment please...' };
    this.gridOptions = <GridOptions>{
      context: {
        agGridBaseClass: this,
        gridParent: this.gridParent
      },
      defaultColDef: {
        // editable: true
        // stopEditingWhenGridLosesFocus=true,
      },
      // onRowEditingStopped: this.onRowUpdateComplete,
      // onCellMouseOver: this.onCellMouseOver
    };
    this.gridOptions.defaultColDef.sortable = true;
    this.gridOptions.defaultColDef.filter = true;
    this.gridOptions.defaultColDef.resizable = true;
    if (this.secondaryGridOptionsParam) {
      // assign gridOptions to sycn column definitions with another grid
      this.gridOptions = Object.assign(this.secondaryGridOptionsParam, this.gridOptions);
    }
    this.gridOptions = {
      columnDefs: [
        { field: '0', minWidth: 180 },
        this.createColumnDef('First Name', (value) => value.length > 1),
        this.createColumnDef('Last Name', (value) => value.length > 1),
        this.createColumnDef('Age', (value) => value.length > 1),
        this.createColumnDef('Country', (value) => value.length > 1),
        { field: 'Date', minWidth: 100 },
        { field: 'Id' }
      ],

      defaultColDef: {
        resizable: true,
        minWidth: 80,
        flex: 1,
      },

      rowData: [],
    };
  }

  syncValidator(newValue, validateFn) {
    if (validateFn(newValue)) {
      alert('All good')
    } else {
      alert('not good')
    }
  };

  syncValueSetter(validateFn) {
    return (params) => {
      this.syncValidator(
        params.newValue,
        validateFn

      );
      return false;
    }
  };
  createColumnDef(field, validationFn) {
    return {
      headerName: field,
      field,
      valueGetter: params => params.data[field],
      valueSetter: this.syncValueSetter(validationFn),
      editable: true,
      cellRenderer: function (params) {
        return params.value.length > 0 ? params.value : `<div style="border: 1px solid red; height:90%">${' '}</div>`;
      }
    };
  }

  // read the raw data and convert it to a XLSX workbook
  convertDataToWorkbook(dataRows) {
    /* convert data to binary string */
    var data = new Uint8Array(dataRows);
    var arr = [];

    for (var i = 0; i !== data.length; ++i) {
      arr[i] = String.fromCharCode(data[i]);
    }

    var bstr = arr.join('');

    return XLSX.read(bstr, { type: 'binary' });
  }

  // pull out the values we're after, converting it into an array of rowData

  populateGrid(workbook) {
    // our data is in the first sheet
    var firstSheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[firstSheetName]

    var columns = {

      A: '0',
      B: 'First Name',
      C: 'Last Name',
      D: 'Gender',
      E: 'Country',
      F: 'Age',
      G: 'Date',
      H: 'Id',
    };
    var rowData = [];

    // start at the 2nd row - the first row are the headers
    var rowIndex = 2;

    // iterate over the worksheet pulling out the columns we're expecting
    while (worksheet['A' + rowIndex]) {
      var row = {};
      Object.keys(columns).forEach(function (column) {
        row[columns[column]] = worksheet[column + rowIndex]?.w || '';
      });

      rowData.push(row);

      rowIndex++;
    }

    console.log(rowData)
    // finally, set the imported rowData into the grid
    this.gridOptions.api.setRowData(rowData);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    console.log(params, 'params')
    this.gridColumnApi = params.columnApi;

    if (this.rowModelType === 'normal') {
      if (this.agGridRowHeight === undefined) {
        this.agGridRowHeight = 37;
      } else {
        this.gridOptions.rowHeight = this.agGridRowHeight;
      }
    }

    this.gridReadyComplete.emit({ baseGrid: this, params: params });
  }

  export() {
    console.log(this.gridApi)
    this.gridApi.exportDataAsCsv()
  }

  onFileSelected(event) {

    const file: File = event.target.files[0];

    if (file) {

      this.fileName = file.name;

      console.log(file)

      let fileReader: FileReader = new FileReader();
      let self = this;
      fileReader.onloadend = (x) => {
        var workbook = this.convertDataToWorkbook(fileReader.result);

        this.populateGrid(workbook);
      }
      fileReader.readAsArrayBuffer(file);
    }
  }
}
