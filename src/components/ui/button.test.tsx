/* eslint-disable @next/next/no-html-link-for-pages */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('is keyboard operable and calls its action', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Create club</Button>);
    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'Create club' })).toHaveFocus();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports link composition without nesting interactive controls', () => {
    render(
      <Button asChild>
        <a href="/onboarding">Get started</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/onboarding');
  });
});
