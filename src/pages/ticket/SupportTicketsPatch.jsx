import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { Button } from '@material-tailwind/react';

let currentUser = JSON.parse(localStorage.getItem("userDataStore"));

const apiUrl = import.meta.env.VITE_API_URL_BASE_API;

const SupportTicketsPatch = () => {
    const [tableData, setTableData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    
    // Modals
    const [createModal, setCreateModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    
    // Form data
    const [newTicketData, setNewTicketData] = useState({
        issue_description: '',
        status: 'open'
    });
    
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [editTicketData, setEditTicketData] = useState({});

    useEffect(() => {
        fetchTickets();
    }, [currentPage, pageSize, searchText]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/support_tickets/`, {
                params: {
                    page: currentPage,
                    per_page: pageSize,
                    search: searchText
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
            });            

            if (response?.status === 200) {
                const { total_items, items } = response?.data;
                setTableData(items);
                setTotalRecords(total_items);
            }
        } catch (error) {
            showErrorToast("Error fetching tickets data", error);
            console.error("Error fetching tickets:", error);
        }
        setLoading(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPageSize(newPerPage);
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/api/support_tickets`, 
                {
                    issue_description: newTicketData.issue_description,
                    status: newTicketData.status,
                    user_id: currentUser.id
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.access_token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                showSuccessToast("Ticket created successfully");
                setCreateModal(false);
                fetchTickets();
                resetNewTicketForm();
            } else {
                showErrorToast("Failed to create ticket");
            }
        } catch (error) {
            showErrorToast("Failed to create ticket", error);
        }
    };

    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${apiUrl}/api/support_tickets/${selectedTicket?.ticket_id}`,
                {
                    issue_description: editTicketData.issue_description,
                    status: editTicketData.status
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.access_token}`
                    }
                }
            );

            if (response.status === 200) {
                showSuccessToast("Ticket updated successfully");
                setEditModal(false);
                fetchTickets();
            } else {
                showErrorToast("Failed to update ticket");
            }
        } catch (error) {
            showErrorToast("Failed to update ticket", error);
        }
    };

    const handleDeleteTicket = (ticket) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ticket #${ticket?.ticket_id}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(
                        `${apiUrl}/api/support_tickets/${ticket?.ticket_id}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentUser.access_token}`
                            }
                        }
                    );

                    if (response.status === 200) {
                        showSuccessToast("Ticket deleted successfully");
                        fetchTickets();
                    } else {
                        showErrorToast("Failed to delete ticket");
                    }
                } catch (error) {
                    showErrorToast("Failed to delete ticket", error);
                }
            }
        });
    };

    const resetNewTicketForm = () => {
        setNewTicketData({
            issue_description: '',
            status: 'open'
        });
    };

    const showSuccessToast = (message) => {
        Swal.fire({
            icon: 'success',
            title: message,
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    };

    const showErrorToast = (message, error = null) => {
        let errorMessage = message;
        if (error?.response?.data?.detail) {
            errorMessage = Array.isArray(error.response.data.detail) 
                ? error.response.data.detail[0]?.msg || error.response.data.detail
                : error.response.data.detail;
        }

        Swal.fire({
            icon: 'error',
            title: errorMessage,
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    };

    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
    ];

    const columns = [
        { 
            name: 'Ticket ID', 
            selector: row => row?.ticket_id?.substring(0, 8), 
            width: '15%' 
        },
        { 
            name: 'Description', 
            selector: row => row?.issue_description?.length > 50 
                ? `${row.issue_description.substring(0, 50)}...` 
                : row.issue_description,
            width: '30%' 
        },
        { 
            name: 'Status', 
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    row?.status === 'open' ? "bg-blue-100 text-blue-800" :
                    row?.status === 'in_progress' ? "bg-yellow-100 text-yellow-800" :
                    row?.status === 'resolved' ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                }`}>
                    {row?.status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
            ),
            width: '15%'
        },
        { 
            name: 'Created At', 
            selector: row => moment(row?.created_at).format('LLL'), 
            width: '15%' 
        },
        { 
            name: 'Updated At', 
            selector: row => moment(row?.updated_at).format('LLL'), 
            width: '15%' 
        },
        { 
            name: 'Actions', 
            cell: row => (
                <div className="flex flex-wrap">
                    <button 
                        className="m-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        onClick={() => {
                            setSelectedTicket(row);
                            setViewModal(true);
                        }}
                    >
                        View
                    </button>
                    <button 
                        className="m-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        onClick={() => {
                            setSelectedTicket(row);
                            setEditTicketData({
                                issue_description: row?.issue_description,
                                status: row?.status
                            });
                            setEditModal(true);
                        }}
                    >
                        Edit
                    </button>
                    
                </div>
            ),
            width: '20%'
        }
    ];

    return (
        <div className="p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <p></p>
                <div className="w-full md:w-64 float-right">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search Tickets..."
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                pagination
                paginationServer
                paginationPerPage={pageSize}
                paginationTotalRows={totalRecords}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                paginationRowsPerPageOptions={[10, 20, 50, 100]}
                progressPending={loading}
                persistTableHead
                progressComponent={
                    <div className="flex items-center justify-center p-4">
                        <span className="text-lg">
                            <span className="text-gray-600">Fetching data, please wait</span>
                            <span className="animate-pulse">.</span>
                            <span className="animate-pulse delay-1000">.</span>
                            <span className="animate-pulse delay-2000">.</span>
                        </span>
                    </div>
                }
                className="border rounded-lg overflow-hidden"
            />


            {/* View Ticket Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    viewModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Ticket Details</h5>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setViewModal(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                {selectedTicket && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Ticket ID</p>
                            <p className="text-gray-800">{selectedTicket?.ticket_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">User ID</p>
                            <p className="text-gray-800">{selectedTicket?.user_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Issue Description</p>
                            <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket?.issue_description}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                selectedTicket?.status === 'open' ? "bg-blue-100 text-blue-800" :
                                selectedTicket?.status === 'in_progress' ? "bg-yellow-100 text-yellow-800" :
                                selectedTicket?.status === 'resolved' ? "bg-green-100 text-green-800" :
                                "bg-gray-100 text-gray-800"
                            }`}>
                                {selectedTicket?.status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Created At</p>
                            <p className="text-gray-800">{moment(selectedTicket?.created_at).format('LLL')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="text-gray-800">{moment(selectedTicket?.updated_at).format('LLL')}</p>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end pt-6">
                    <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setViewModal(false)}
                    >
                        Close
                    </button>
                </div>
            </aside>

            {/* Edit Ticket Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    editModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Edit Ticket</h5>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setEditModal(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleUpdateTicket} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editTicketData.issue_description}
                            onChange={(e) => setEditTicketData({...editTicketData, issue_description: e.target.value})}
                            required
                            rows={5}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editTicketData.status}
                            onChange={(e) => setEditTicketData({...editTicketData, status: e.target.value})}
                            required
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            onClick={() => setEditModal(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Update Ticket
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
};

export default SupportTicketsPatch;