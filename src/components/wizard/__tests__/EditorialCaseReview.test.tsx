/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorialCaseReview } from '../EditorialCaseReview';

afterEach(cleanup);
const props = {analysis:{case_facts:{landlord_full_name:'Alex Landlord',tenant_full_name:'Chris Tenant',property_address_line1:'14 Courtyard',property_address_town:'Leeds',rent_amount:1200,rent_frequency:'monthly'}},blockingIssues:[],warnings:[],hasBlockingIssues:false,onFixIssue:vi.fn(),onFixIssues:vi.fn(),onEdit:vi.fn(),onProceed:vi.fn(),children:<p>Existing detailed review</p>};
describe('Editorial case review',()=>{
  it('shows saved case details and proceeds immediately when ready',()=>{
    render(<EditorialCaseReview {...props} />);
    expect(screen.getByText('14 Courtyard, Leeds')).toBeInTheDocument();
    expect(screen.getByText('Chris Tenant')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Continue to preview'}));
    expect(props.onProceed).toHaveBeenCalled();
  });
  it('surfaces required fixes and routes the selected issue to the existing handler',()=>{
    const issue={description:'Confirm tenant name',affected_question_id:'tenant_full_name'};
    render(<EditorialCaseReview {...props} blockingIssues={[issue]} hasBlockingIssues />);
    expect(screen.getByRole('button',{name:'Continue to preview'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Fix this'}));
    expect(props.onFixIssue).toHaveBeenCalledWith(issue);
  });
  it('does not let the new action bypass the arrears schedule requirement',()=>{
    render(<EditorialCaseReview {...props} analysis={{case_facts:{section8_grounds:['8'],arrears_items:[]}}} />);
    expect(screen.getByText('Complete the arrears schedule for the selected grounds.')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Continue to preview'})).toBeDisabled();
  });
  it('shows warnings without blocking and preserves paid regeneration',()=>{
    render(<EditorialCaseReview {...props} warnings={['Keep records current']} isPaid />);
    expect(screen.getByText('Keep records current')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Regenerate pack'})).toBeEnabled();
  });
});
