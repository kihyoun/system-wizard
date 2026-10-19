import { Box, Button, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const documentation = 'https://github.com/kihyoun/system/blob/master/';
const steps = [
    {
        title: 'Prepare your platform',
        description: 'Start with an Ubuntu host and mounted persistent storage. The handbook guides you through checkout, Docker and the first startup.',
        link: 'docs/HANDBOOK.md#0-getting-started',
        label: 'Follow the handbook'
    },
    {
        title: 'Connect and configure',
        description: 'Open the Wizard and enter your Sync address and credentials. Fetch the saved settings, then review your services, domains and runner count.',
        link: 'docs/HANDBOOK.md#06-open-edit-and-enter-the-connection-details-first',
        label: 'Read the connection guide'
    },
    {
        title: 'Create your first project',
        description: 'Choose an application starter and configure its environments. Follow the build and test results before a deliberate production rollout.',
        link: 'docs/PROJECT_BOOTSTRAP_GUIDE.md',
        label: 'Explore application projects'
    }
];

export default function Overview({ onOpenWizard }: { onOpenWizard: () => void }) {
    return (<Stack spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper component="section" elevation={0} sx={{ p: { xs: 3, md: 5 }, borderTop: 4, borderColor: 'secondary.main' }}>
       <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 7 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.14em' }}>System Bootstrapper · Open source</Typography>
        <Typography component="h1" variant="h3" sx={{ mt: 1, mb: 2, fontWeight: 700, fontSize: { xs: '2.5rem', md: '4rem' }, letterSpacing: '-0.04em' }}>
          Getting Started
        </Typography>
        <Typography variant="h6" component="p" sx={{ mb: 2, maxWidth: 760 }}>
          Build your web projects. Bring your development tools together.
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 850, lineHeight: 1.75 }}>
          System Bootstrapper brings GitLab, runners, a container registry and deployment routing
          onto infrastructure you control. This Wizard helps you configure that platform and turn
          an application idea into a project with source, CI and environments.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3, alignItems: { sm: 'center' } }}>
          <Button variant="contained" color="secondary" disableElevation endIcon={<ArrowForwardIcon />} onClick={onOpenWizard}>
            Open Wizard
          </Button>
          <Button component="a" href={`${documentation}docs/HANDBOOK.md`} startIcon={<MenuBookIcon />} sx={{ color: theme => theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark' }}>
            Read the handbook
          </Button>
        </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ borderRadius: 2, bgcolor: 'action.hover', p: { xs: 2, md: 3 }, textAlign: 'center' }}>
            <Box component="svg" viewBox="0 0 360 320" aria-hidden="true" sx={{ display: 'block', width: '100%', maxWidth: 320, mx: 'auto', color: 'secondary.main' }}>
              <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
                <path d="M105 100 150 55H325V215L280 260H105Z M105 100H280L325 55 M280 100V260" />
                <path d="M150 55V215H325 M105 260 150 215" opacity="0.3" />
                <path d="M28 240 45 223H94V272L77 289H28Z M28 240H77L94 223 M77 240V289" />
                <path d="M94 248H105" strokeDasharray="2 4" />
              </g>
              <g fill="currentColor" fontFamily="monospace">
                <text x="126" y="165" fontSize="21" fontWeight="700">SYSTEM</text>
                <text x="126" y="190" fontSize="13" letterSpacing="1">BOOTSTRAPPER</text>
              </g>
            </Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.09em' }}>Your tools. Your infrastructure.</Typography>
          </Box>
        </Grid>
       </Grid>
      </Paper>

      <Paper component="section" elevation={0} sx={{ p: { xs: 3, md: 4 } }} aria-labelledby="overview-steps-heading">
        <Typography component="h2" variant="h5" id="overview-steps-heading" sx={{ mb: 3 }}>From setup to your first project</Typography>
        <Grid component="ol" container spacing={3} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {steps.map((step, index) => (<Grid component="li" key={step.title} size={{ xs: 12, md: 4 }}>
            <Box aria-hidden="true" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>0{index + 1}</Box>
            <Typography component="h3" variant="h6" sx={{ mb: 1 }}>{step.title}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>{step.description}</Typography>
            <Link href={`${documentation}${step.link}`} underline="hover" sx={{ color: theme => theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark' }}>{step.label}</Link>
          </Grid>))}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper component="section" elevation={0} sx={{ p: { xs: 3, md: 4 }, height: '100%' }} aria-labelledby="overview-capabilities-heading">
            <Typography component="h2" variant="h5" id="overview-capabilities-heading" sx={{ mb: 2 }}>Make room for your ideas</Typography>
            <Stack component="ul" spacing={2} sx={{ pl: 2, mb: 0 }}>
              <li><Typography><strong>Configure your toolchain.</strong> Manage GitLab, the registry, runner managers and service routing from one interface.</Typography></li>
              <li><Typography><strong>Build and deliver applications.</strong> Start with React, Angular, a general web project or an empty repository, then work with editable source and CI.</Typography></li>
              <li><Typography><strong>Keep a path back.</strong> Back up configuration separately and retain your persistent storage. Harvest and Seed provide service-data snapshots for recovery.</Typography></li>
            </Stack>
            <Link href={`${documentation}docs/RECOVERY_CONTRACT.md`} underline="hover" sx={{ display: 'inline-block', mt: 3, color: theme => theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark' }}>Understand persistence and recovery</Link>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper component="section" elevation={0} sx={{ p: { xs: 3, md: 4 }, height: '100%' }} aria-labelledby="overview-vision-heading">
            <Typography component="h2" variant="h5" id="overview-vision-heading" sx={{ mb: 2 }}>Built to evolve</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.75, mb: 2 }}>
              The long-term goal is a platform that can build and validate its next generation.
              Today’s explicit Wizard source, build and promotion steps provide a foundation;
              complete autonomous renewal remains a vision.
            </Typography>
            <Link href={`${documentation}README.md`} underline="hover" sx={{ color: theme => theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark' }}>Explore the project and architecture</Link>
          </Paper>
        </Grid>
      </Grid>
    </Stack>);
}
