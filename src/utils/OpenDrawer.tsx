import { drawerNavigationRef } from "../navigation/navigationRef";

 const OpenDrawer = () => {
  const drawer = drawerNavigationRef.current as any;
  if (drawer?.openDrawer) {
    drawer.openDrawer();
  } else {
    console.log('Drawer is not ready yet.');
  }
};


export default OpenDrawer;
