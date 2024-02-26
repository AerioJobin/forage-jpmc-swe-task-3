import React, { Component, RefObject } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[];
}

class Graph extends Component<IProps> {
  private perspectiveViewerRef: RefObject<HTMLPerspectiveViewerElement>;

  constructor(props: IProps) {
    super(props);
    this.perspectiveViewerRef = React.createRef();
  }

  componentDidMount() {
    this.initializePerspectiveViewer();
  }

  componentDidUpdate() {
    this.updatePerspectiveTable();
  }

  initializePerspectiveViewer() {
    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      const table = window.perspective.worker().table(schema);
      if (this.perspectiveViewerRef.current) {
        this.perspectiveViewerRef.current.load(table);
        this.setPerspectiveViewerAttributes();
      }
    }
  }

  setPerspectiveViewerAttributes() {
    if (this.perspectiveViewerRef.current) {
      this.perspectiveViewerRef.current.setAttribute('view', 'y_line');
      this.perspectiveViewerRef.current.setAttribute('row-pivots', '["timestamp"]');
      this.perspectiveViewerRef.current.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      this.perspectiveViewerRef.current.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  updatePerspectiveTable() {
    if (this.perspectiveViewerRef.current) {
      const tableData = DataManipulator.generateRow(this.props.data);
      const table = this.perspectiveViewerRef.current.table;
      if (table) {
        table.update([tableData]);
      }
    }
  }

  render() {
    return (
      <perspective-viewer ref={this.perspectiveViewerRef} className="perspective-viewer"></perspective-viewer>
    );
  }
}

export default Graph;
