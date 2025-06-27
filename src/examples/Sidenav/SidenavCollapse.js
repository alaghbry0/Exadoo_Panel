// src/examples/Sidenav/SidenavCollapse.js

import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "examples/Sidenav/styles/sidenavCollapse";
import { useMaterialUIController } from "context";

// A-Shariki: أضفنا isSubitem هنا
function SidenavCollapse({ icon, name, active, isSubitem, ...rest }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;

  return (
    <ListItem component="li">
      <MDBox
        {...rest}
        sx={(theme) =>
          collapseItem(theme, {
            active,
            transparentSidenav,
            whiteSidenav,
            darkMode,
            sidenavColor,
            isSubitem, // A-Shariki: تمرير الخاصية لدالة الأنماط
          })
        }
      >
        <ListItemIcon
          sx={(theme) =>
            collapseIconBox(theme, { transparentSidenav, whiteSidenav, darkMode, active })
          }
        >
          {typeof icon === "string" ? (
            <Icon sx={(theme) => collapseIcon(theme, { active })}>{icon}</Icon>
          ) : (
            icon
          )}
        </ListItemIcon>

        <ListItemText
          primary={name}
          sx={(theme) =>
            collapseText(theme, {
              miniSidenav,
              transparentSidenav,
              whiteSidenav,
              active,
              isSubitem, // A-Shariki: تمرير الخاصية لدالة الأنماط
            })
          }
        />
      </MDBox>
    </ListItem>
  );
}

SidenavCollapse.defaultProps = {
  active: false,
  isSubitem: false, // A-Shariki: إضافة قيمة افتراضية
};

SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  isSubitem: PropTypes.bool, // A-Shariki: تعريف نوع الخاصية
};

export default SidenavCollapse;
