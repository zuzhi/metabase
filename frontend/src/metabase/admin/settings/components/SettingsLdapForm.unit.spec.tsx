import userEvent from "@testing-library/user-event";
import fetchMock from "fetch-mock";

import { renderWithProviders, screen, waitFor } from "__support__/ui";
import type { InputSettingType } from "metabase-types/api";
import { createMockGroup } from "metabase-types/api/mocks";

import type { SettingValues } from "./SettingsLdapForm";
import { SettingsLdapFormView } from "./SettingsLdapForm";

const GROUPS = [
  createMockGroup(),
  createMockGroup({ id: 2, name: "Administrators" }),
  createMockGroup({ id: 3, name: "foo" }),
  createMockGroup({ id: 4, name: "bar" }),
  createMockGroup({ id: 5, name: "flamingos" }),
];

const elements = [
  {
    // placeholder: false,
    key: "ldap-enabled",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_ENABLED",
    // description: null,
    default: false,
    originalValue: null,
    display_name: "LDAP Authentication",
    type: "boolean" as InputSettingType,
  },
  {
    placeholder: "ldap.yourdomain.org",
    key: "ldap-host",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_HOST",
    description: "Server hostname.",
    default: null,
    originalValue: null,
    display_name: "LDAP Host",
    type: "string" as InputSettingType,
    required: true,
    autoFocus: true,
  },
  {
    placeholder: "389",
    key: "ldap-port",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_PORT",
    description: "Server port, usually 389 or 636 if SSL is used.",
    default: 389,
    originalValue: null,
    display_name: "LDAP Port",
    type: "string" as InputSettingType,
  },
  {
    placeholder: "none",
    key: "ldap-security",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_SECURITY",
    // description: null,
    default: "none",
    originalValue: null,
    display_name: "LDAP Security",
    type: "radio" as InputSettingType,
    defaultValue: "none",
  },
  {
    // placeholder: null,
    key: "ldap-bind-dn",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_BIND_DN",
    description:
      "The Distinguished Name to bind as (if any), this user will be used to lookup information about other users.",
    default: null,
    originalValue: null,
    display_name: "Username or DN",
    type: "string" as InputSettingType,
  },
  {
    // placeholder: null,
    key: "ldap-password",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_PASSWORD",
    description: "The password to bind with for the lookup user.",
    default: null,
    originalValue: null,
    display_name: "Password",
    type: "password" as InputSettingType,
  },
  {
    // placeholder: null,
    key: "ldap-user-base",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_USER_BASE",
    description: "Search base for users. (Will be searched recursively)",
    default: null,
    originalValue: null,
    display_name: "User search base",
    type: "string" as InputSettingType,
    required: true,
  },
  {
    placeholder: "(&(objectClass=inetOrgPerson)(|(uid={login})(mail={login})))",
    key: "ldap-user-filter",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_USER_FILTER",
    description:
      "User lookup filter. The placeholder {login} will be replaced by the user supplied login.",
    default: "(&(objectClass=inetOrgPerson)(|(uid={login})(mail={login})))",
    originalValue: null,
    display_name: "User filter",
    type: "string" as InputSettingType,
  },
  {
    placeholder: "mail",
    key: "ldap-attribute-email",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_ATTRIBUTE_EMAIL",
    description:
      "Attribute to use for the user's email. (usually 'mail', 'email' or 'userPrincipalName')",
    default: "mail",
    originalValue: null,
    display_name: "Email attribute",
    type: "string" as InputSettingType,
  },
  {
    placeholder: "givenName",
    key: "ldap-attribute-firstname",
    value: "givenname",
    is_env_setting: false,
    env_name: "MB_LDAP_ATTRIBUTE_FIRSTNAME",
    description:
      "Attribute to use for the user's first name. (usually 'givenName')",
    default: "givenName",
    originalValue: "givenname",
    display_name: "First name attribute",
    type: "string" as InputSettingType,
  },
  {
    placeholder: "sn",
    key: "ldap-attribute-lastname",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_ATTRIBUTE_LASTNAME",
    description: "Attribute to use for the user's last name. (usually 'sn')",
    default: "sn",
    originalValue: null,
    display_name: "Last name attribute",
    type: "string" as InputSettingType,
  },
  {
    // placeholder: false,
    key: "ldap-group-sync",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_GROUP_SYNC",
    // description: null,
    default: false,
    originalValue: null,
  },
  {
    // placeholder: null,
    key: "ldap-group-base",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_GROUP_BASE",
    description:
      "Search base for groups. Not required for LDAP directories that provide a 'memberOf' overlay, such as Active Directory. (Will be searched recursively)",
    default: null,
    originalValue: null,
    display_name: "Group search base",
    type: "string" as InputSettingType,
  },
  {
    // placeholder: {},
    key: "ldap-group-mappings",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_GROUP_MAPPINGS",
    description: "JSON containing LDAP to Metabase group mappings.",
    default: {},
    originalValue: null,
  },
  {
    placeholder: "(member={dn})",
    key: "ldap-group-membership-filter",
    value: null,
    is_env_setting: false,
    env_name: "MB_LDAP_GROUP_MEMBERSHIP_FILTER",
    description:
      "Group membership lookup filter. The placeholders {dn} and {uid} will be replaced by the user's Distinguished Name and UID, respectively.",
    default: "(member={dn})",
    originalValue: null,
    display_name: "Group membership filter",
    type: "string" as InputSettingType,
  },
  {
    key: "ldap-sync-admin-group",
    display_name: "Sync Administrator group",
    type: "boolean" as InputSettingType,
  },
];

const setup = (settingValues: SettingValues) => {
  const onSubmit = jest.fn();

  fetchMock.get("path:/api/permissions/group", GROUPS);

  renderWithProviders(
    <SettingsLdapFormView
      elements={elements}
      settingValues={settingValues}
      onSubmit={onSubmit}
    />,
    {},
  );

  return {
    onSubmit,
  };
};

describe("SettingsLdapForm", () => {
  it("should submit the correct payload", async () => {
    const { onSubmit } = setup({
      "ldap-enabled": true,
      "ldap-group-membership-filter": "",
    });

    const ATTRS = {
      "ldap-host": "example.com",
      "ldap-port": 123,
      "ldap-security": "ssl",
      "ldap-user-base": "user-base",
      "ldap-user-filter": "(filter1)",
      "ldap-bind-dn": "username",
      "ldap-password": "password",
      "ldap-attribute-email": "john@example.com",
      "ldap-attribute-firstname": "John",
      "ldap-attribute-lastname": "Doe",
      "ldap-enabled": true,
      "ldap-group-sync": true,
      "ldap-group-base": "group-base",
      "ldap-group-membership-filter": "(filter2)",
      "ldap-sync-admin-group": undefined,
    };

    await userEvent.type(
      await screen.findByRole("textbox", { name: /LDAP Host/ }),
      ATTRS["ldap-host"],
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /LDAP Port/ }),
      ATTRS["ldap-port"].toString(),
    );
    await userEvent.click(screen.getByRole("radio", { name: /SSL/ }));
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Username or DN/ }),
      ATTRS["ldap-bind-dn"],
    );
    await userEvent.type(
      screen.getByLabelText(/Password/),
      ATTRS["ldap-password"],
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /User search base/ }),
      ATTRS["ldap-user-base"],
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /User filter/ }),
      ATTRS["ldap-user-filter"],
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Email attribute/ }),
      ATTRS["ldap-attribute-email"],
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /First name attribute/ }),
      ATTRS["ldap-attribute-firstname"],
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Last name attribute/ }),
      ATTRS["ldap-attribute-lastname"],
    );
    await userEvent.click(screen.getByTestId("group-sync-switch")); // checkbox for "ldap-group-sync"
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Group search base/ }),
      ATTRS["ldap-group-base"],
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Group membership filter/ }),
      ATTRS["ldap-group-membership-filter"],
    );

    await userEvent.click(await screen.findByRole("button", { name: /Save/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(ATTRS);
    });
  });

  it("should hide group membership fields when appropriate", async () => {
    setup({ "ldap-enabled": true });
    expect(
      screen.queryByRole("textbox", { name: /Group membership filter/ }),
    ).not.toBeInTheDocument();
  });
});
