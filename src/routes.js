// routes.js
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import ManagePlans from "layouts/ManagePlans";
import PaymentsTable from "layouts/PaymentsTable";
import IncomingTransactions from "layouts/incomingTransactions";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import ChatbotSettings from "layouts/ChatbotSettings";
import Icon from "@mui/material/Icon";
import Users from "layouts/users";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Manage Plans",
    key: "ManagePlans",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/ManagePlans",
    component: <ManagePlans />,
  },
  {
    type: "collapse",
    name: "User management",
    key: "users",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/users",
    component: <Users />,
  },
  {
    type: "collapse",
    name: "Subscription management",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Chatbot Settings",
    key: "chatbot-settings",
    icon: <Icon fontSize="small">smart_toy</Icon>,
    route: "/chatbot-settings",
    component: <ChatbotSettings />,
  },
  {
    type: "collapse",
    name: "Payments Table",
    key: "PaymentsTable",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/PaymentsTable",
    component: <PaymentsTable />,
  },
  {
    type: "collapse",
    name: "Incoming Transactions",
    key: "incomingTransactions",
    icon: <Icon fontSize="small">receipt</Icon>,
    route: "/incoming-transactions",
    component: <IncomingTransactions />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
