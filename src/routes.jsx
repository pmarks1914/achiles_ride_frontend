import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserPlusIcon,
  CircleStackIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  Cog6ToothIcon,
  TicketIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Rider from "./pages/rider/rider";
import Customer from "./pages/customer/customer";
import Staff from "./pages/staff/staff";
import SupportTickets from "./pages/ticket/SupportTickets";
import RideToday from "./pages/ride/RideToday";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "customer",
        path: "/customer",
        element: <Customer />,
      },
      {
        icon: <UserPlusIcon {...icon} />,
        name: "rider",
        path: "/rider",
        element: <Rider />,
      },
      {
        icon: <TicketIcon {...icon} />,
        name: "ticket",
        path: "/ticket",
        element: <SupportTickets />,
      },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
    ],
  },
  {
    title: "Ride",
    layout: "dashboard",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "ride today",
        path: "/ride-today",
        element: <RideToday typeData={"ride-today"}/>,
      },
      {
        icon: <CircleStackIcon {...icon} />,
        name: "all ride ",
        path: "/all-ride",
        element: <RideToday typeData={"all-ride"} />,
      }]
  },
  {
    title: "Internal",
    layout: "dashboard",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "staff",
        path: "/staff",
        element: <Staff />,
      },
      // {
      //   icon: <Cog6ToothIcon {...icon} />,
      //   name: "setting",
      //   path: "/setting",
      //   // element: <SignUp />,
      // },
    ],
  },
];

export default routes;
