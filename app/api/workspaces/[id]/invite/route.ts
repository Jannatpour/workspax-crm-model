// app/api/workspaces/[id]/invite/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/send-email'; // You would need to implement this

// Generate a secure token for invitations
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Check if user has permission to invite (owner or admin)
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Unauthorized - Insufficient permissions' },
        { status: 403 }
      );
    }

    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['admin', 'member', 'guest'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user exists, check if they're already a member
    if (user) {
      const existingMembership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: user.id,
        },
      });

      if (existingMembership) {
        // Update role if different
        if (existingMembership.role !== role) {
          await prisma.workspaceMember.update({
            where: { id: existingMembership.id },
            data: { role },
          });
          return NextResponse.json({ success: true, message: 'Member role updated' });
        }

        return NextResponse.json(
          { error: 'User is already a member of this workspace' },
          { status: 400 }
        );
      }

      // Add user directly to workspace if they exist
      await prisma.workspaceMember.create({
        data: {
          role,
          user: {
            connect: { id: user.id },
          },
          workspace: {
            connect: { id: workspaceId },
          },
        },
      });

      // Get workspace details for the notification
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      });

      // Send notification email to user
      try {
        /* In a real app, you would send an email here
        await sendEmail({
          to: email,
          subject: `You've been added to ${workspace?.name}`,
          text: `You have been added to the workspace "${workspace?.name}" as a ${role}.`,
          html: `<p>You have been added to the workspace <strong>${workspace?.name}</strong> as a <strong>${role}</strong>.</p>`,
        });
        */
        console.log(
          `Would send email to ${email} about being added to workspace ${workspace?.name}`
        );
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue even if email fails
      }

      return NextResponse.json({ success: true, added: true });
    }

    // For non-existing users, create an invitation
    // Generate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create an invitation
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        email,
        role,
        token: generateToken(),
        expiresAt,
        workspace: {
          connect: { id: workspaceId },
        },
        invitedBy: {
          connect: { id: session.user.id },
        },
      },
    });

    // Get workspace details for the invitation email
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    // Send invitation email
    try {
      /* In a real app, you would send an email here
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitation.token}`;

      await sendEmail({
        to: email,
        subject: `Invitation to join ${workspace?.name}`,
        text: `You have been invited to join the workspace "${workspace?.name}" as a ${role}. Click this link to accept: ${inviteUrl}`,
        html: `<p>You have been invited to join the workspace <strong>${workspace?.name}</strong> as a <strong>${role}</strong>.</p><p><a href="${inviteUrl}">Click here to accept the invitation</a></p>`,
      });
      */
      console.log(`Would send invitation email to ${email} for workspace ${workspace?.name}`);
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error('Error inviting user to workspace:', error);
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
  }
}
