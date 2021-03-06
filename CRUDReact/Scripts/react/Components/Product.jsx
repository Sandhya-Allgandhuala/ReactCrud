﻿import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Table, Button, Icon, Menu, Form, Confirm, Loader } from 'semantic-ui-react';
import AddeditProduct from './AddeditProduct.jsx'
import Index from './Index.jsx'

export default class ProductList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            ProductData: [],
            error: null,
            showModal: false,
            showConfirm: false,
            record: {}

        };

        // Called by the onClick event of Add New button.
        this.addNew = this.addNew.bind(this);
        // Called by one of the Edit buttons' click events.
        this.edit = this.edit.bind(this);
        // Called by the Cancel button of the AddEditModal.
        this.cancel = this.cancel.bind(this);
        // Called by the Save button of the AddEditModal.
        this.save = this.save.bind(this);
        // Called by one of the delete buttons' click events.
        this.showDelete = this.showDelete.bind(this);
        // Called by the Cancel button of the Confirm semantic component.
        this.cancelDelete = this.cancelDelete.bind(this);
        // Called by the Yes button of the Confirm semantic component.
        this.confirmDelete = this.confirmDelete.bind(this);

    }

    componentDidMount() {

        this.fetchData();

    }

    //fetchData is to get all the record from database and shows in front end
    fetchData() {

        this.setState({
            isLoading: true,
            ProductData: []

        })

        fetch('/Product/GetProductData/')
            .then(response => response.json())
            .then(ProductData => this.setState({
                ProductData,
                isLoading: true

            }))

            .catch(error => console.log('parsing failed', error))

    }

    addNew() {
        this.setState({
            record: {},
            showModal: true
        });
    }

    edit(recordToEdit) {
        this.setState({
            record: recordToEdit,
            showModal: true
        });
    }

    cancel() {
        this.setState({
            showModal: false
        });
    }

    save(recordToSave) {
        const closeModal = () => this.setState({ showModal: false });
        if (recordToSave.Id) {
            this.update(recordToSave, closeModal);
        } else {
            this.create(recordToSave, closeModal);

        }
    }

    create(recordToCreate, callback) {

        const createRecord = JSON.stringify(recordToCreate);
        fetch('/Product/SaveProductData/', {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            body: createRecord
        }) // We're parsing the response as JSON.
            .then(response => response.json())
            .then(bodyAsObject => {
                if (bodyAsObject.success) {
                    this.setState(state => {

                        const newRecords = [...state.ProductData, bodyAsObject.data];
                        return {
                            ProductData: newRecords
                        };
                    }, callback);
                } else {
                    this.setState(
                        {
                            error: bodyAsObject.message
                        },
                        callback
                    );
                }
            })
            .catch(error => {
                this.setState(
                    {
                        error: "There was an error communicating with the back-end"
                    },
                    callback
                );
            });
    }


    update(recordToUpdate, callback) {
        const editRecord = JSON.stringify(recordToUpdate);
        fetch('/Product/UpdateProductData/' +
            recordToUpdate.Id,
            {
                method: "PUT",
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                body: editRecord
            }
        )
            .then(response => response.json())
            .then(bodyAsObject => {
                if (bodyAsObject.success) {
                    let updatedRecords = this.state.ProductData.slice();
                    const recordIndex = updatedRecords.findIndex(
                        record => record.Id === recordToUpdate.Id
                    );
                    updatedRecords[recordIndex] = recordToUpdate;

                    this.setState(
                        {
                            ProductData: updatedRecords
                        },
                        callback
                    );
                } else {
                    this.setState(
                        {
                            error: bodyAsObject.message
                        },
                        callback
                    );
                }
            })
            .catch(error => {
                this.setState(
                    {
                        error: "There was an error communicating with the back-end"
                    },
                    callback
                );
            });
    }

    showDelete(recordToDelete) {
        this.setState({
            showConfirm: true,
            record: recordToDelete
        });
    }

    cancelDelete() {
        this.setState({
            showConfirm: false,
            record: {}
        });
    }

    confirmDelete() {
        this.setState({ showConfirm: false });
        const recordToDelete = this.state.record;
        if (recordToDelete.Id) {
            this.delete(recordToDelete);
        }
    }

    delete(recordToDelete) {
        fetch('/Product/DeleteProductData/' + recordToDelete.Id)
            .then(response => response.json())
            .then(bodyAsObject => {
                if (bodyAsObject.success) {
                    const updatedCustomers = this.state.ProductData.filter(record => record.Id != recordToDelete.Id);
                    // Update the state.
                    this.setState({ ProductData: updatedCustomers });
                }
                else {
                    this.setState({
                        error: bodyAsObject.message
                    });
                }
            })
            .catch(error => {
                this.setState({
                    error: 'There was an error communicating with the back-end'
                });
            });
    }

    render() {

        return (
            this.state.error ?
                <div>{this.state.error}</div>
                :
                <div>
                    <React.Fragment>
                        {this.state.showModal && (
                            <AddeditProduct
                                isOpen={true}
                                record={this.state.record}
                                header={this.state.record.Id ? "Edit Product" : "Add Product"}
                                save={this.save}
                                cancel={this.cancel}
                            />
                        )}
                        {this.state.showConfirm && (
                            <Confirm

                                open={true}
                                onCancel={this.cancelDelete}
                                onConfirm={this.confirmDelete}
                            />
                        )}
                        <div><Index  /></div>
                        <br />
                        <Button className="ui primary button" onClick={this.addNew}>Add Product</Button>
                        <Table striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Address</Table.HeaderCell>
                                    <Table.HeaderCell>Actions</Table.HeaderCell>
                                    <Table.HeaderCell>Actions</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {this.state.ProductData.map(record => (
                                    <Table.Row key={record.Id}>
                                        <Table.Cell>{record.Name}</Table.Cell>
                                        <Table.Cell>${record.Price}</Table.Cell>
                                        <Table.Cell>
                                            <Button className="ui blue button"
                                                onClick={() => this.edit(record)}>
                                                <i className="edit icon"></i>Edit</Button>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button className="ui blue button"
                                                onClick={() => this.showDelete(record)}>
                                                <i className="trash icon"></i>Delete</Button>

                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </React.Fragment>

                </div>

        );
    }
}


//React call Product list in main id
const app = document.getElementById('Productmain');
ReactDOM.render(
    <ProductList />, app
);
