import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { SplitButton } from "primereact/splitbutton";
import { confirmDialog } from "primereact/confirmdialog";
import "./App.scss";

class CRUDTable extends Component {
  DataTableRef = React.createRef();

  FormChildRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalType: "create",
      modalTempValue: undefined,
      modalLoading: false,
      modalTitle: "",
      onEditValue: undefined,
      globalFilter: "",
    };
  }

  handleBindForm = (submitForm, key) => {
    this[key] = submitForm;
  };

  handleResetFilter = () => {
    this.setState({
      globalFilter: "",
    });

    if (!_.isNull(this.DataTableRef.current)) {
      this.DataTableRef.current.reset();
    }
  };

  handleModalSubmit = (values) => {
    const { onSubmit } = this.props;
    const { modalType } = this.state;

    const callback = () => {
      this.setState({
        modalVisible: false,
        modalType: "create",
        modalTempValue: undefined,
        onEditValue: undefined,
      });
    };

    const loading = (bool) => this.setState({ modalLoading: bool });
    if (onSubmit) {
      onSubmit(values, modalType, callback, loading);
    }
  };

  handleOnEdit = (record) => {
    const { title } = this.props;

    this.handleControlModal(true, "edit", record, `編輯${title}`, record);
  };

  handleOnDelete = (event, record) => {
    const { onDelete } = this.props;

    confirmDialog({
      message: "您確定要刪除此筆資料？",
      header: "刪除資料",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => onDelete(record),
    });
  };

  handleControlModal = (visible, type, record, title, onEditValue) => {
    this.setState({
      modalVisible: visible,
      modalType: type,
      modalTempValue: record,
      modalTitle: title,
      onEditValue,
    });
  };

  renderTable = () => {
    const {
      title,
      tableData,
      tableColumns,
      rowKey,
      rows,
      columnWidth,
      isMobile,
      showCreate,
      showEdit,
      showDelete,
      customAction,
      noAction,
    } = this.props;
    const { globalFilter } = this.state;

    const actions = (record) => {
      let arr = customAction;

      if (showEdit) {
        arr = [
          ...arr,
          {
            label: "編輯資料",
            icon: "pi pi-pencil",
            command: () => this.handleOnEdit(record),
          },
        ];
      }

      if (showDelete) {
        arr = [
          ...arr,
          {
            label: "刪除資料",
            icon: "pi pi-trash",
            command: (e) => this.handleOnDelete(e, record),
          },
        ];
      }

      return arr;
    };

    return (
      <DataTable
        ref={this.DataTableRef}
        paginator
        rows={rows || 10}
        showGridlines
        dataKey={rowKey}
        value={tableData}
        scrollable
        header={
          <div className="table-header p-grid">
            <div className="left-btn p-col-12 p-md-6">
              {showCreate && (
                <Button
                  type="button"
                  label={`新增${title}`}
                  icon={`pi pi-plus`}
                  className={`${isMobile && "p-button-sm"} mr-12`}
                  onClick={() =>
                    this.handleControlModal(
                      true,
                      "create",
                      undefined,
                      `新增${title}`,
                      undefined
                    )
                  }
                />
              )}
              <Button
                type="button"
                label="清除"
                className={`${isMobile && "p-button-sm"} p-button-outlined`}
                icon="pi pi-filter-slash"
                onClick={this.handleResetFilter}
              />
            </div>
            <div className="right-btn p-col-12 p-md-6">
              <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  value={globalFilter}
                  className="p-inputtext-lg p-d-block"
                  onChange={(e) =>
                    this.setState({ globalFilter: e.target.value })
                  }
                  placeholder="請輸入要搜尋的文字"
                />
              </div>
            </div>
          </div>
        }
        globalFilter={globalFilter}
        emptyMessage="暫無資料。"
      >
        {_.map(tableColumns, (column) => (
          <Column
            key={column.key}
            field={column.key}
            header={column.title}
            headerStyle={{ width: _.get(column, "width", columnWidth) }}
            sortable
            filter
            filterMatchMode="contains"
            filterPlaceholder={`搜尋${column.title}`}
            body={(rowData) => (
              <>
                <span className="p-column-title">{column.title}：</span>
                {_.get(column, "render")
                  ? column.render(rowData)
                  : _.get(rowData, column.key)}
              </>
            )}
          />
        ))}
        {!noAction && (
          <Column
            field="action"
            header="操作"
            body={(record) => (
              <SplitButton
                label="功能"
                icon="pi pi-th-large"
                className="p-button-success"
                model={actions(record)}
              />
            )}
          />
        )}
      </DataTable>
    );
  };

  render() {
    const { FormChild } = this.props;
    const { modalLoading, modalVisible, modalTitle, onEditValue } = this.state;

    return (
      <div id="crud-table">
        {this.renderTable()}
        <Dialog
          header={modalTitle}
          visible={modalVisible}
          breakpoints={{ "960px": "90vw" }}
          style={{ width: "50vw" }}
          footer={
            <div>
              <Button
                label="取消"
                icon="pi pi-times"
                onClick={() =>
                  this.handleControlModal(
                    false,
                    "create",
                    undefined,
                    "",
                    undefined
                  )
                }
                className="p-button-text"
              />
              <Button
                label="確定"
                icon="pi pi-check"
                loading={modalLoading}
                onClick={(e) => this.FormChildRef(e)}
                autoFocus
              />
            </div>
          }
          onHide={() =>
            this.handleControlModal(false, "create", undefined, "", undefined)
          }
        >
          {!_.isNull(FormChild) && (
            <FormChild
              initialValues={onEditValue}
              bindForm={(e) => this.handleBindForm(e, "FormChildRef")}
              onSubmit={this.handleModalSubmit}
            />
          )}
        </Dialog>
      </div>
    );
  }
}

CRUDTable.propTypes = {
  title: PropTypes.string,
  tableData: PropTypes.array,
  tableColumns: PropTypes.array,
  rowKey: PropTypes.string,
  rows: PropTypes.number,
  columnWidth: PropTypes.number,

  showCreate: PropTypes.bool,
  showEdit: PropTypes.bool,
  showDelete: PropTypes.bool,

  isMobile: PropTypes.bool,
  customAction: PropTypes.array,
  noAction: PropTypes.bool,

  onSubmit: PropTypes.func,
  FormChild: PropTypes.any,
};

CRUDTable.defaultProps = {
  title: "Something",
  tableData: [],
  tableColumns: [],
  rowKey: "id",
  rows: 10,
  columnWidth: 150,

  showCreate: false,
  showEdit: false,
  showDelete: false,

  isMobile: false,
  customAction: [],
  noAction: false,

  onSubmit: (values, type, callback, loading) => callback(),
  // onDelete: () => {},

  FormChild: null,
};

export default CRUDTable;
