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
        icon: <CircleStackIcon {...icon} />,
        name: "ride",
        path: "/ride",
        element: <Profile />,
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
    title: "Internal",
    layout: "dashboard",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "staff",
        path: "/staff",
        // element: <SignIn />,
      },
      {
        icon: <TicketIcon {...icon} />,
        name: "ticket",
        path: "/ticket",
        // element: <SignUp />,
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "setting",
        path: "/setting",
        // element: <SignUp />,
      },
    ],
  },
];

export default routes;
