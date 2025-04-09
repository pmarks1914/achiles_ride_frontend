import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  BanknotesIcon,
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL_BASE_API;
let currentUser = JSON.parse(localStorage.getItem("userDataStore"));

export function Home() {
  const [statsDetails, setStatsDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prepare statistics cards data based on API response
  const statisticsCardsData = [
    {
      color: "blue",
      icon: BanknotesIcon,
      title: "Today's Payments",
      value: statsDetails?.today_payments?.total_amount || 0,
      footer: {
        color: "text-green-500",
        value: `${statsDetails?.today_payments?.completed || 0}`,
        label: "completed payments today",
      },
    },
    {
      color: "orange",
      icon: UserGroupIcon,
      title: "Today's Rides",
      value: statsDetails?.ride_stats?.today?.total || 0,
      footer: {
        color: "text-green-500",
        value: `${statsDetails?.ride_stats?.today?.completed || 0}`,
        label: "completed rides today",
      },
    },
    {
      color: "green",
      icon: UsersIcon,
      title: "This Week's Rides",
      value: statsDetails?.ride_stats?.week?.total || 0,
      footer: {
        color: "text-blue-500",
        value: "",
        label: "total rides this week",
      },
    },
    {
      color: "amber",
      icon: ChartBarIcon,
      title: "This Month's Rides",
      value: statsDetails?.ride_stats?.month?.total || 0,
      footer: {
        color: "text-blue-500",
        value: "",
        label: "total rides this month",
      },
    },
  ];

  // Prepare charts data based on API response
  const statisticsChartsData = [
    {
      color: "grey",
      title: "Daily Payments",
      description: "Last 6 Days Payment Trends",
      footer: "updated 1 min ago",
      chart: {
        type: "bar",
        height: 300,
        series: [
          {
            name: "Amount",
            data: statsDetails?.last_six_days_payments?.map(item => item.total_amount) || [0, 0, 0, 0, 0, 0],
          },
        ],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            categories: statsDetails?.last_six_days_payments?.map(item => item.date) || ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
          },
        },
      },
    },
    {
      color: "grey",
      title: "Monthly Payments",
      description: "Last 6 Months Payment Trends",
      footer: "updated just now",
      chart: {
        type: "line",
        height: 300,
        series: [
          {
            name: "Amount",
            data: statsDetails?.last_six_months_payments?.map(item => item.total_amount) || [0, 0, 0, 0, 0, 0],
          },
        ],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            categories: statsDetails?.last_six_months_payments?.map(item => `${item.month} ${item.year}`) || ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
          },
        },
      },
    },
  ];

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${apiUrl}/api/admin/dashboard/stats`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`,
        }
      });
      setStatsDetails(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography variant="h6">Loading dashboard data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography color="red" variant="h6">
          Error: {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-12 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
      
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Rides Overview
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>{statsDetails?.today_rides_status?.completed || 0} completed</strong> today
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Refresh</MenuItem>
                <MenuItem>Export</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Status", "Count", "Percentage"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { status: "Completed", count: statsDetails?.today_rides_status?.completed || 0 },
                  { status: "In Progress", count: statsDetails?.today_rides_status?.in_progress || 0 },
                  { status: "Cancelled", count: statsDetails?.today_rides_status?.cancelled || 0 },
                  { status: "Total", count: statsDetails?.today_rides_status?.total || 0 },
                ].map(({ status, count }, key) => {
                  const className = `py-3 px-5 ${
                    key === 3 ? "" : "border-b border-blue-gray-50"
                  }`;
                  const percentage = statsDetails?.today_rides_status?.total 
                    ? Math.round((count / statsDetails.today_rides_status.total) * 100)
                    : 0;

                  return (
                    <tr key={status}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {status}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {count}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="w-10/12">
                          <Typography
                            variant="small"
                            className="mb-1 block text-xs font-medium text-blue-gray-600"
                          >
                            {percentage}%
                          </Typography>
                          <Progress
                            value={percentage}
                            variant="gradient"
                            color={
                              status === "Completed" ? "green" : 
                              status === "In Progress" ? "blue" : 
                              status === "Cancelled" ? "red" : "amber"
                            }
                            className="h-1"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Payment Status
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>{
                statsDetails?.today_payments?.total_amount 
                  ? Math.round((statsDetails.today_payments.completed / statsDetails.today_payments.total_amount) * 100)
                  : 0
              }%</strong> success rate today
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {[
              {
                icon: CheckCircleIcon,
                color: "text-green-500",
                title: "Completed",
                description: `${statsDetails?.today_payments?.completed || 0} payments`,
              },
              {
                icon: ClockIcon,
                color: "text-amber-500",
                title: "Pending",
                description: `${statsDetails?.today_payments?.pending || 0} payments`,
              },
              {
                icon: BanknotesIcon,
                color: "text-red-500",
                title: "Failed",
                description: `${statsDetails?.today_payments?.failed || 0} payments`,
              },
              {
                icon: ChartBarIcon,
                color: "text-blue-500",
                title: "Total Amount",
                description: `$${statsDetails?.today_payments?.total_amount?.toFixed(2) || 0}`,
              },
            ].map(({ icon, color, title, description }, key) => (
              <div key={title} className="flex items-start gap-4 py-3">
                <div
                  className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                    key === 3 ? "after:h-0" : "after:h-4/6"
                  }`}
                >
                  {React.createElement(icon, {
                    className: `!w-5 !h-5 ${color}`,
                  })}
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="block font-medium"
                  >
                    {title}
                  </Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-xs font-medium text-blue-gray-500"
                  >
                    {description}
                  </Typography>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
