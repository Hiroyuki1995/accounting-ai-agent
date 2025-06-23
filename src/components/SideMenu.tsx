'use client';

import BusinessIcon from '@mui/icons-material/Business';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

const drawerWidth = 240;
const collapsedWidth = 64;

const menuItems = [
  {
    text: '書類データ管理',
    icon: <DescriptionIcon />,
    href: '/file',
  },
  {
    text: 'ユーザー管理',
    icon: <PeopleIcon />,
    href: '/user',
  },
  {
    text: '自社口座設定',
    icon: <DescriptionIcon />,
    href: '/account-settings',
  },
  {
    text: '取引先管理',
    icon: <BusinessIcon />,
    href: '/partners',
  },
];

export default function SideMenu() {
  const [open, setOpen] = React.useState(true);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.2s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        [`& .MuiDrawer-paper`]: {
          width: open ? drawerWidth : collapsedWidth,
          transition: 'width 0.2s',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-end' : 'center', padding: 8 }}>
          <IconButton onClick={handleToggle} size="small">
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component="a"
                href={item.href}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
      <div style={{ width: '100%' }}>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {open && <ListItemText primary="ログアウト" />}
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
} 