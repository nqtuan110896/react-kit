import React from 'react';
import NavigationDrawer from 'react-md/lib/NavigationDrawers';

const { DrawerTypes } = NavigationDrawer;

export default class App extends React.Component {
  render() {
    return (
      <NavigationDrawer
        desktopDrawerType={DrawerTypes.FULL_HEIGHT}
        mobileDrawerType={DrawerTypes.TEMPORARY}
        tabletDrawerType={DrawerTypes.PERSISTENT}
        toolbarThemeType="default"
        toolbarTitle="Custom Homepage">
        <div>Content for my first custom homepage.</div>
      </NavigationDrawer>
    );
  }
}