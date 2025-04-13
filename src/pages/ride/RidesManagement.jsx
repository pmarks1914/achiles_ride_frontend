import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { XMarkIcon, CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Button, Chip, Badge } from '@material-tailwind/react';

let currentUser = JSON.parse(localStorage.getItem("userDataStore"));
const apiUrl = import.meta.env.VITE_API_URL_BASE_API;

const RidesManagement = (props) => {

    const [tableData, setTableData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState({});
    
    // Modals
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    
    const [selectedRide, setSelectedRide] = useState(null);
    const [editRideData, setEditRideData] = useState({});

    useEffect(() => {
        fetchRides();
    }, [currentPage, pageSize, searchText, statusFilter, props?.typeData]);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/ride/all/`, {
                params: {
                    page: currentPage,
                    page_size: pageSize,
                    start_date: dateRange[0] ? moment(dateRange[0]).format('YYYY-MM-DD') : null,
                    end_date: dateRange[1] ? moment(dateRange[1]).format('YYYY-MM-DD') : null,
                    search: searchText,
                    status: statusFilter,
                    today: props?.typeData === "ride-today" ? true : false
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
            });            

            if (response?.status === 200) {
                const { current_page, total_items, page_size, total_pages, items } = response?.data;
                setTableData(items);
                setTotalRecords(total_items);
            }
        } catch (error) {
            toast.error("Error fetching ride data");
            console.error("Error fetching rides:", error);
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

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleUpdateRideStatus = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(
                `${apiUrl}/api/ride/${selectedRide?.ride_id}`,
                {
                    status: editRideData.status
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.access_token}`
                    }
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: `Ride status updated!`,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
                setEditModal(false);
                fetchRides();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: `Error updating ride status`,
                text: error.response?.data?.detail || error.message,
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                closeOnConfirm: false,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed':
                return <Chip color="green" value="Completed" size="sm" />;
            case 'in_progress':
                return <Chip color="blue" value="In Progress" size="sm" />;
            case 'requested':
                return <Chip color="amber" value="Requested" size="sm" />;
            case 'cancelled':
                return <Chip color="red" value="Cancelled" size="sm" />;
            default:
                return <Chip color="gray" value={status} size="sm" />;
        }
    };

    const getPaymentStatusBadge = (status) => {
        switch(status) {
            case 'completed':
                return <Chip color="green" value="Paid" size="sm" />;
            case 'pending':
                return <Chip color="amber" value="Pending" size="sm" />;
            case 'failed':
                return <Chip color="red" value="Failed" size="sm" />;
            default:
                return <Chip color="gray" value={status} size="sm" />;
        }
    };

    const columns = [
        { 
            name: 'No.', 
            selector: (row, index) => index + 1, 
            width: '5%' 
        },
        { 
            name: 'Ride ID', 
            selector: row => row?.ride_id?.substring(0, 8), 
            width: '10%' 
        },
        { 
            name: 'Pickup', 
            selector: row => row?.pickup_location, 
            width: '15%',
            cell: row => (
                <div className="truncate max-w-xs">
                    {row?.pickup_location}
                </div>
            )
        },
        { 
            name: 'Dropoff', 
            selector: row => row?.dropoff_location, 
            width: '15%',
            cell: row => (
                <div className="truncate max-w-xs">
                    {row?.dropoff_location}
                </div>
            )
        },
        { 
            name: 'Status', 
            cell: row => getStatusBadge(row?.status),
            width: '10%'
        },
        { 
            name: 'Fare', 
            selector: row => `${row?.fare?.toFixed(2) || '0.00'}`, 
            width: '10%' 
        },
        { 
            name: 'Payment', 
            cell: row => (
                <div>
                    {row?.payments?.length > 0 ? (
                        getPaymentStatusBadge(row.payments[0].status)
                    ) : (
                        <Chip color="gray" value="No Payment" size="sm" />
                    )}
                </div>
            ),
            width: '10%'
        },
        { 
            name: 'Rating', 
            cell: row => (
                <div>
                    {row?.ratings?.length > 0 ? (
                        <div className="flex items-center">
                            <span className="mr-1">{row.ratings[0].rating}</span>
                            <span className="text-yellow-500">★</span>
                        </div>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
            width: '10%'
        },
        { 
            name: 'Start Time', 
            selector: row => moment(row?.start_time).format('LLL'), 
            width: '15%' 
        }, 
        { 
            name: 'Actions', 
            cell: row => (
                <div className="flex space-x-1">
                    <button 
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                        onClick={() => {
                            setSelectedRide(row);
                            setViewModal(true);
                        }}
                    >
                        View
                    </button>
                    <button 
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        onClick={() => {
                            setSelectedRide(row);
                            setEditRideData({
                                status: row?.status
                            });
                            setEditModal(true);
                        }}
                    >
                        Update
                    </button>
                </div>
            ),
            width: '15%'
        }
    ];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'requested', label: 'Requested' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className=""> 
                    {statusOptions.map((option, id) => (
                        <Button
                            key={option.value}
                            variant={statusFilter === option.value ? "filled" : "outlined"}
                            color={statusFilter === option.value ? "blue" : "gray"}
                            size="sm"
                            className='m-1'
                            onClick={() => handleStatusFilterChange(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
                <div className="w-full md:w-64">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search Rides..."
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

            {/* View Ride Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-2/2 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    viewModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Ride Details</h5>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setViewModal(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                {selectedRide && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h6 className="font-semibold mb-2">Rider</h6>
                                <p className="text-sm text-gray-500">Name </p>
                                <p className="text-gray-800">{selectedRide?.riders?.user?.name}</p>

                                <p className="text-sm text-gray-500">Email </p>
                                <p className="text-gray-800"> {selectedRide?.riders?.user?.email}</p>

                                <p className="text-sm text-gray-500">Phone </p>
                                <p className="text-gray-800"> {selectedRide?.riders?.user?.phone}</p>

                                <p className="text-sm text-gray-500">License Number </p>
                                <p className="text-gray-800"> {selectedRide?.riders?.license_number}</p>

                                <p className="text-sm text-gray-500">Registration Number </p>
                                <p className="text-gray-800"> {selectedRide?.riders?.vehicle_registration}</p>
                            </div>
                            <div>
                                <h6 className="font-semibold mb-2">Rider</h6>

                                <p className="text-sm text-gray-500">Name </p>
                                <p className="text-gray-800">{selectedRide?.customer?.name}</p>

                                <p className="text-sm text-gray-500">Email </p>
                                <p className="text-gray-800"> {selectedRide?.customer?.email}</p>

                                <p className="text-sm text-gray-500">Phone Number </p>
                                <p className="text-gray-800"> {selectedRide?.customer?.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <div className="mt-1">{getStatusBadge(selectedRide?.status)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Pickup Location</p>
                                <p className="text-gray-800">{selectedRide?.pickup_location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Dropoff Location</p>
                                <p className="text-gray-800">{selectedRide?.dropoff_location}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Fare</p>
                                <p className="text-gray-800">{selectedRide?.fare?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Distance</p>
                                <p className="text-gray-800">{selectedRide?.distance} km</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Duration</p>
                                <p className="text-gray-800">
                                    {selectedRide?.start_time && selectedRide?.end_time ? 
                                        moment.duration(moment(selectedRide.end_time).diff(moment(selectedRide.start_time))).humanize() : 
                                        'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Start Time</p>
                                <p className="text-gray-800">{moment(selectedRide?.start_time).format('LLL')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">End Time</p>
                                <p className="text-gray-800">
                                    {selectedRide?.end_time ? 
                                        moment(selectedRide.end_time).format('LLL') : 
                                        'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="border-t pt-4">
                            <h6 className="font-semibold mb-2">Payment Details</h6>
                            {selectedRide?.payments?.length > 0 ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="text-gray-800">
                                                {selectedRide.payments[0].amount?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <div className="mt-1">
                                                {getPaymentStatusBadge(selectedRide.payments[0].status)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Method</p>
                                            <p className="text-gray-800 capitalize">
                                                {selectedRide.payments[0].payment_method || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-500">Payment Date</p>
                                        <p className="text-gray-800">
                                            {moment(selectedRide.payments[0].payment_date).format('LLL')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No payment information available</p>
                            )}
                        </div>

                        {/* Ratings Section */}
                        <div className="border-t pt-4">
                            <h6 className="font-semibold mb-2">Rating & Feedback</h6>
                            {selectedRide?.ratings?.length > 0 ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <span className="text-2xl font-bold mr-2">
                                            {selectedRide.ratings[0].rating}
                                        </span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <span 
                                                    key={i} 
                                                    className={`text-xl ${i < selectedRide.ratings[0].rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({selectedRide.ratings[0].rated_by})
                                        </span>
                                    </div>
                                    {selectedRide.ratings[0].feedback && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">Feedback</p>
                                            <p className="text-gray-800 italic">
                                                "{selectedRide.ratings[0].feedback}"
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">Rated On</p>
                                        <p className="text-gray-800">
                                            {moment(selectedRide.ratings[0].created_at).format('LLL')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No rating information available</p>
                            )}
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

            {/* Edit Ride Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    editModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Update Ride Status</h5>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setEditModal(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleUpdateRideStatus} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                        <p className="text-gray-800 font-medium">{selectedRide?.status}</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editRideData.status}
                            onChange={(e) => setEditRideData({...editRideData, status: e.target.value})}
                            required
                        >
                            <option value="requested">Requested</option>
                            <option value="accepted">Accepted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="justify-end space-x-3 pt-4">
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
                            Update Status
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
};

export default RidesManagement;

