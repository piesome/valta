import * as React from "react";

const styles = require("./EditableField.scss");

export interface IEditableFieldProps {
    value: string;
    enabled: boolean;
    edited: (value: string) => Promise<void>;
}

export interface IEditableFieldState {
    value: string;
    editing: boolean;
}

export class EditableField extends React.Component<IEditableFieldProps, IEditableFieldState> {
    constructor(params: IEditableFieldProps) {
        super(params);

        this.onChange = this.onChange.bind(this);
        this.endEditing = this.endEditing.bind(this);
        this.startEditing = this.startEditing.bind(this);
    }

    public componentWillMount() {
        this.setState({
            editing: false,
            value: this.props.value,
        });
    }

    public componentWillReceiveProps(props: IEditableFieldProps) {
        this.setState({
            editing: false,
            value: props.value,
        });
    }

    public render() {
        if (this.props.enabled && this.state.editing) {
            return (
                <div className={styles.editableField}>
                    <input onChange={this.onChange} value={this.state.value} />
                    <button onClick={this.endEditing}>Save</button>
                </div>
            );
        } else if (this.props.enabled) {
            return (
                <div className={styles.editableField}>
                    <input disabled={true} value={this.state.value} />
                    <button onClick={this.startEditing}>Edit</button>
                </div>
            );
        } else {
            return (<div className={styles.editableField}><input disabled={true} value={this.state.value} /></div>);
        }
    }

    private onChange(event: any) {
        this.setState({value: event.target.value});
    }

    private async endEditing() {
        try {
            await this.props.edited(this.state.value);
        } catch (err) {
            throw err;
        }

        this.setState({editing: false});
    }

    private startEditing() {
        this.setState({editing: true});
    }
}
