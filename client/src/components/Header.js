import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'react-emotion';
import { Grid } from '@8base/boost';

import { UserDropdown } from './UserDropdown.js';
import logo from 'images/8base-logo-red-black.svg';
import newLogo from 'images/rrlogo2.png';

const HeaderTag = styled(Grid.Layout)({
  height: '6rem',
  padding: '0 2rem',
  backgroundColor: '#fff',
  borderBottom: '1px solid #D0D7DD',
});

const HeaderLogoTag = styled('img')({
  height: '3rem',
});

const Header = () => (
  <Grid.Box area="header">
    <HeaderTag columns="1fr auto" gap="lg">
      <Grid.Box justifyContent="center">
        <Link to="/">
          <HeaderLogoTag src={newLogo} alt="8base logo" />
        </Link>
      </Grid.Box>
      <Grid.Box justifyContent="center">
        <UserDropdown />
      </Grid.Box>
    </HeaderTag>
  </Grid.Box>
);

export { Header };
//<HeaderLogoTag src={logo} alt="8base logo" />