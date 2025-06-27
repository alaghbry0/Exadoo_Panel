// src/examples/Sidenav/SidenavGroup.js

import { useState } from "react";
import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import List from "@mui/material/List";
import MDBox from "components/MDBox";
import {
  collapseItem,
  collapseIconBox,
  collapseText,
} from "examples/Sidenav/styles/sidenavCollapse";
import { useMaterialUIController } from "context";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

function SidenavGroup({ icon, name, collapse, ...rest }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const isAnyChildActive = collapse.some((item) => item.route === location.pathname);
  const [open, setOpen] = useState(isAnyChildActive);

  const handleSetOpen = () => setOpen(!open);

  const renderCollapse = collapse.map((item) => {
    const { name: itemName, route, key: itemKey, icon: itemIcon } = item;
    const collapseName = location.pathname.replace("/", "");

    return (
      <NavLink key={itemKey} to={route} sx={{ textDecoration: "none" }}>
        <SidenavCollapse
          name={itemName}
          icon={itemIcon}
          active={itemKey === collapseName}
          // A-Shariki: أضفنا الخاصية الجديدة هنا
          isSubitem //  <-- هذا يعادل isSubitem={true}
          // A-Shariki: تعديل الـ sx لزيادة المحاذاة وتصغير المسافات
          sx={{
            pl: 4, // زيادة المسافة البادئة اليسرى للمحاذاة
            py: 0.75, // تقليل المسافة البادئة الرأسية
            mx: 2, // الهامش الأفقي
            my: 0.25, // تقليل الهامش الرأسي بين العناصر
          }}
        />
      </NavLink>
    );
  });

  return (
    <>
      <ListItem component="li">
        <MDBox
          {...rest}
          onClick={handleSetOpen}
          sx={(theme) =>
            collapseItem(theme, {
              active: isAnyChildActive,
              transparentSidenav,
              whiteSidenav,
              darkMode,
              sidenavColor,
            })
          }
        >
          <MDBox
            sx={(theme) =>
              collapseIconBox(theme, {
                transparentSidenav,
                whiteSidenav,
                darkMode,
                active: isAnyChildActive,
              })
            }
          >
            {typeof icon === "string" ? <Icon>{icon}</Icon> : icon}
          </MDBox>

          <ListItemText
            primary={name}
            sx={(theme) =>
              collapseText(theme, {
                miniSidenav,
                transparentSidenav,
                whiteSidenav,
                active: isAnyChildActive,
              })
            }
          />
          <Icon
            sx={{
              justifySelf: "flex-end",
              color: (theme) =>
                isAnyChildActive ? theme.palette.white.main : theme.palette.grey[600],
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease-in-out",
              display: miniSidenav ? "none" : "block",
            }}
          >
            expand_more
          </Icon>
        </MDBox>
      </ListItem>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        sx={{ display: miniSidenav ? "none" : "block" }}
      >
        <List component="div" disablePadding>
          {renderCollapse}
        </List>
      </Collapse>
    </>
  );
}

SidenavGroup.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  collapse: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SidenavGroup;
