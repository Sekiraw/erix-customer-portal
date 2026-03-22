/**
 * Email service — pseudo/stub implementation.
 * TODO: Replace console.log calls with an actual email provider (e.g., Resend, SendGrid, Nodemailer).
 */

export type RegistrationEmailData = {
  email: string
  firstName: string
  lastName: string
}

/** Sent immediately after the user submits the registration form (confirmation step). */
export async function sendRegistrationConfirmationEmail(user: RegistrationEmailData): Promise<void> {
  console.log(`[EMAIL STUB] Registration confirmation → ${user.email}`)
  // TODO: Send an email asking the user to confirm their email address.
}

/** Sent after the email is confirmed (auto-confirmed in current implementation). */
export async function sendRegistrationSuccessEmail(user: RegistrationEmailData): Promise<void> {
  console.log(`[EMAIL STUB] Registration success → ${user.email}`)
  // TODO: Send a welcome / successful registration email.
}

/** Sent to a single employee/manager/IT staff member when a new customer registers. */
export async function sendEmployeeNewUserNotificationEmail(
  newUser: RegistrationEmailData,
  employeeEmail: string,
): Promise<void> {
  console.log(
    `[EMAIL STUB] New user notification → ${employeeEmail} (new customer: ${newUser.email})`,
  )
  // TODO: Send a notification email to the employee.
}

/**
 * Looks up all employees/managers/IT staff in the database and sends them
 * a notification email about the newly registered customer.
 */
export async function notifyAllEmployeesByEmail(
  newUser: RegistrationEmailData,
  payload: import('payload').Payload,
): Promise<void> {
  const { docs: staff } = await payload.find({
    collection: 'users',
    where: { role: { in: ['employee', 'manager', 'it_staff'] } },
    overrideAccess: true,
    limit: 200,
  })

  await Promise.all(
    staff.map((member) => sendEmployeeNewUserNotificationEmail(newUser, member.email)),
  )
}
