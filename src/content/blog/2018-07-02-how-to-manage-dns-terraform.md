---
ID: 471
title: >
  Dynamic update of Bind9 server in Azure
  with Terraform !
author: etienne.deneuve
description: ""
tags:
  - Terraform
  - Azure
  - Dns
  - Bind9
  - Cloud Init
slug: 2018/07/02/how-to-manage-dns-terraform
img: /assets/stock-4.jpg
img_alt: "nice abstract image"
published: true
pubDate: 2018-07-02 12:35:17
---

## Terraform your DNS

In this blog post, I post my article posted on Cellenza Blog, translated in English. The french version is [here](https://blog.cellenza.com/cloud-2/azure/comment-utiliser-hashicorp-terraform-pour-gerer-vos-dns-bind9-dans-azure/).

The purpose of this blog post is to deploy and configure a Bind9 DNS Server in your Azure subscription and make it able to receive DNS Update form Terraform. I'm pretty sure that you will understand why it's so cool ! If not, the goal is to be able to have local DNS that you can manage when you deploy new resources in Azure. Of course, it can work in many other cloud or on premise environment as Bind9 is real standard DNS.

> The way is give is voluntary simplified. To make it good for production you need to add a control VM and not expose your DNS directly with a public IP. It's only a proof of concept

<!--more-->

## Terraform DNS Provider

In Terraform plugins, there's a DNS Provider who help to manipulate a DNS correctly setted according to RFC 2136 and 2845. Thoses RFC normalize dns dynamic updates, this is normally used with a DHCP.

## Cloud Init

We will use [Cloud Init](https://cloud-init.io/) for primary setup of our Labs, Cloud Init will be lauchned in the very low boot stage.

## Building the folder structure for the POC

Open Visual Studio Code and create a base folder `$workdir` and create the folling files & folders :

```shell
- bind
   - main.tf
   - files/cloudconfig.tpl
   - data.tf
   - variables.tf
   - provider.tf
- dns
   - main.tf
   - provider.tf
```

## Deploy Bind9 VM

### Terraform

In the file `bind/provider.tf`, add this :

```hcl
provider "azurerm" {
version = "1.6.0"
}

provider "template" {
version = "1.0.0"
}
```

In `bind/data.tf`, add this :

```hcl
data "template_cloudinit_config" "config" {
gzip = true
base64_encode = true

part {
content_type = "text/cloud-config"
content = "${data.template_file.cloudconfig.rendered}"
}
}

data "template_file" "cloudconfig" {
template = "${file("cloudconfig.tpl")}"
}
```

And in `bind/main.tf` add this (don't forget to change ```` by a secure password) :

```hcl
resource "azurerm_resource_group" "tf-bind" {
name = "RG-bind"
location = "West Europe"

tags = {
Project = "bind"
}
}

resource "azurerm_virtual_network" "tf-vnet" {
name = "vnet-bind"
location = "${azurerm_resource_group.tf-bind.location}"
resource_group_name = "${azurerm_resource_group.tf-bind.name}"
address_space = ["10.0.0.0/16"]

tags = {
Project = "bind"
}
}

resource "azurerm_subnet" "tf-snet" {
name = "main"
resource_group_name = "${azurerm_resource_group.tf-bind.name}"
virtual_network_name = "${azurerm_virtual_network.tf-vnet.name}"
address_prefix = "10.0.0.0/24"
}

resource "azurerm_virtual_machine" "tf-vm-bind" {
count = 1
name = "bind-vm0${count.index}"
location = "${azurerm_resource_group.tf-bind.location}"
resource_group_name = "${azurerm_resource_group.tf-bind.name}"
network_interface_ids = ["${element(azurerm_network_interface.tf-nic.*.id, count.index)}"]
vm_size = "Standard_B1ms"
delete_os_disk_on_termination = true

storage_image_reference {
publisher = "Canonical"
offer = "UbuntuServer"
sku = "16.04-LTS"
version = "latest"
}

storage_os_disk {
name = "dsk-vm0${count.index}"
caching = "ReadWrite"
create_option = "FromImage"
managed_disk_type = "Standard_LRS"
}

os_profile {
computer_name = "bind-vm0${count.index}"
admin_username = "edeneuve"
admin_password = ""
custom_data = "${data.template_cloudinit_config.config.rendered}"
}

os_profile_linux_config {
disable_password_authentication = false
}

tags = {
Project = "bind"
}
}

resource "azurerm_network_interface" "tf-nic" {
count = "1"
name = "nic-vm${count.index}"
resource_group_name = "${azurerm_resource_group.tf-bind.name}"
location = "${azurerm_resource_group.tf-bind.location}"

ip_configuration {
name = "ipconfig"
private_ip_address_allocation = "dynamic"
subnet_id = "${azurerm_subnet.tf-snet.id}"
public_ip_address_id = "${element(azurerm_public_ip.MyResource.*.id, count.index)}"
}

tags = {
Project = "bind"
}
}

resource "azurerm_public_ip" "MyResource" {
count = "1"
name = "pip-vm${count.index}"
resource_group_name = "${azurerm_resource_group.tf-bind.name}"
location = "${azurerm_resource_group.tf-bind.location}"
public_ip_address_allocation = "dynamic"

tags = {
Project = "bind"
}
}
```

In the cloud config template `bind/files/cloudconfig.tpl`, add this:

```yaml
#cloud-config
package_upgrade: true
packages:
  - bind9
  - dnsutils
```

Let's deploy !
First connect you to Azure using `az login`, secondly launch `terraform init` from the bind folder, then test your copy/paste with `terraform plan` and finally `terraform apply`. Take a coffee, your Bind server is under construction.

### Bind setup

Connect you on the newly deploy vm using SSH and go to `/etc/bind/` and generate a key using `sudo rndc-confgen`

You should now have a `rdnc.key` within the current folder and with some content like :

```shell
$ sudo cat /etc/bind/rndc.key

key "rndc-key" {
algorithm hmac-md5;
secret "REDACTED";
};
```

Now, we will edit the config file of Bind9, the main config is `named.conf`. You need to add a reference to the new `rndc.key` :

```ini
include "/etc/bind/rndc.key";
```

Then, create new zone in `named.conf.local` (You can change the `toto.int.local.` by something different :

```config
zone "toto.int.local." {
type master;
file "/etc/bind/zones/db.toto.int.local";
update-policy {
grant rndc-key zonesub any;
};
};
```

Finally, create a new zone file in a subfolder called `zones` (create it) and add the following content in a zone file `/etc/bind/zones/db.toto.int.local` (name must match with the "file" directive in the `named.conf.local`) :

> NS must match your server hostname and records must be correct to.

```config
$ORIGIN .
$TTL 3600       ; 1 hour
toto.int.local          IN SOA  ns1.toto.int.local. root.toto.int.local. (
                                2012033116 ; serial
                                3600       ; refresh (1 hour)
                                1800       ; retry (30 minutes)
                                604800     ; expire (1 week)
                                43200      ; minimum (12 hours)
                                )
                        NS      ns1.toto.int.local.
                        NS      ns2.toto.int.local.
$ORIGIN toto.int.local.
$TTL 3600       ; 1 hour
ns1                     A       137.117.141.166
ns2                     A       137.117.141.166
```

As Bind need to create and modify the content in the folder you need to setup right according to :

```shell
sudo chown -R root:bind ./zones
sudo chmod -R 640 ./zones
```

And then restart bind using :

```shell
sudo systemctl restart bind9
```

Check the bind logs using :

```shell
tail /var/log/syslog | grep named

Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: 255.255.255.255.IN-ADDR.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: 0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: 1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: D.F.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: 8.E.F.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: 9.E.F.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: A.E.F.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: B.E.F.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: 8.B.D.0.1.0.0.2.IP6.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: automatic empty zone: EMPTY.AS112.ARPA
Jun 15 07:44:25 bind-vm00 named[4233]: configuring command channel from "/etc/bind/rndc.key"
Jun 15 07:44:25 bind-vm00 named[4233]: command channel listening on 127.0.0.1#953
Jun 15 07:44:25 bind-vm00 named[4233]: configuring command channel from "/etc/bind/rndc.key"
Jun 15 07:44:25 bind-vm00 named[4233]: command channel listening on ::1#953
Jun 15 07:44:25 bind-vm00 named[4233]: managed-keys-zone: loaded serial 13
Jun 15 07:44:25 bind-vm00 named[4233]: zone 0.in-addr.arpa/IN: loaded serial 1
Jun 15 07:44:25 bind-vm00 named[4233]: zone 127.in-addr.arpa/IN: loaded serial 1
Jun 15 07:44:25 bind-vm00 named[4233]: zone 255.in-addr.arpa/IN: loaded serial 1
Jun 15 07:44:25 bind-vm00 named[4233]: zone localhost/IN: loaded serial 2
Jun 15 07:44:25 bind-vm00 named[4233]: zone toto.int.local/IN: loaded serial 2012033116
Jun 15 07:44:25 bind-vm00 named[4233]: all zones loaded
Jun 15 07:44:25 bind-vm00 named[4233]: running
Jun 15 07:44:25 bind-vm00 named[4233]: zone toto.int.local/IN: sending notifies (serial 2012033116)
```

AppArmor need to be updated to let bind change the zones, so you need to set it. To set AppArmor, you need to change the file `/etc/apparmor.d/usr.sbin.named` and add the line `/etc/bind/zones/** rw,` in this part :

```shell
cat /etc/apparmor.d/usr.sbin.named
[...]
# /etc/bind should be read-only for bind
# /var/lib/bind is for dynamically updated zone (and journal) files.
# /var/cache/bind is for slave/stub data, since we"re not the origin of it.
# See /usr/share/doc/bind9/README.Debian.gz
/etc/bind/** r,
/etc/bind/zones/** rw,
/var/lib/bind/** rw,
/var/lib/bind/ rw,
/var/cache/bind/** lrw,
/var/cache/bind/ rw,
[...]
```

After the modification restart AppArmor deamon with `sudo systemctl restart apparmor`, then check the named profile is loaded `aa-status`.

```shell
aa-status
apparmor module is loaded.
14 profiles are loaded.
14 profiles are in enforce mode.
/sbin/dient
/usr/bin/lxc-start
/usr/lib/NetworkManager/nm-dhcp-client.action
/usr/lib/NetworkManager/nm-dhcp-helper
/usr/lib/connman/scripts/dient-script
/usr/lib/lxd/lxd-bridge-proxy
/usr/lib/snapd/snap-confine
/usr/lib/snapd/snap-confine//mount-namespace-capture-helper
/usr/sbin/named
/usr/sbin/tcpdump
lxc-container-default
lxc-container-default-cgns
lxc-container-default-with-mounting
lxc-container-default-with-nesting
0 profiles are in complain mode.
2 processes have profiles defined.
0 processes are in enforce mode.
0 processes are in complain mode.
2 processes are unconfined but have a profile defined.
/sbin/dient (921)
/usr/sbin/named (6523)
```

## Dynamic DNS Update With Terraform

Now we will work in the `dns` folder :

```shell
- dns
- main.tf
- provider.tf
```

In `provider.tf`, add this :

```hcl
provider "dns" {
update {
server = ""
key_name = ""
key_algorithm = "hmac-md5"
key_secret = ""
}
}
```

Then from the dns folder launch `terraform init`, to grab the dns plugin.

In the `main.tf` file add Terraform resources :

```hcl
resource "dns_a_record_set" "www" {
zone = "toto.int.local."
name = "www"

addresses = [
"192.168.0.1",
"192.168.0.2",
"192.168.0.3",
]

ttl = 300
}

resource "dns_cname_record" "foo" {
zone = "toto.int.local."
name = "foo"
cname = "tata.toto.int.local."
ttl = 300
}

resource "dns_a_record_set" "xxx" {
zone = "toto.int.local."
name = "tata"
addresses = ["192.168.0.1"]
ttl = 300
}
```

Then plan with `terraform plan` :

```shell
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but will not be
persisted to local or remote state storage.

------------------------------------------------------------------------

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
+ create

Terraform will perform the following actions:

+ dns_a_record_set.www
id:
addresses.#: "3"
addresses.1737095236: "192.168.0.3"
addresses.2307365224: "192.168.0.1"
addresses.277792978: "192.168.0.2"
name: "www"
ttl: "300"
zone: "toto.int.local."

+ dns_a_record_set.xxx
id:
addresses.#: "1"
addresses.2307365224: "192.168.0.1"
name: "tata"
ttl: "300"
zone: "toto.int.local."

+ dns_cname_record.foo
id:
cname: "tata.toto.int.local."
name: "foo"
ttl: "300"
zone: "toto.int.local."

Plan: 3 to add, 0 to change, 0 to destroy.

------------------------------------------------------------------------

Note: You didn"t specify an "-out" parameter to save this plan, so Terraform
can"t guarantee that exactly these actions will be performed if
"terraform apply" is subsequently run.
```

You can now apply with `terraform apply`. Check the dns log with `cat /var/log/syslog | grep named` :

```shell
Jun 15 09:02:24 bind-vm00 named[6523]: client XX.xx.XX.XX#61068/key rndc: updating zone "toto.int.local/IN": deleting rrset at "www.toto.int.local" A
Jun 15 09:02:24 bind-vm00 named[6523]: zone toto.int.local/IN: sending notifies (serial 2012033123)
Jun 15 09:02:24 bind-vm00 named[6523]: client XX.xx.XX.XX#61066/key rndc: updating zone "toto.int.local/IN": deleting rrset at "foo.toto.int.local" CNAME
Jun 15 09:02:24 bind-vm00 named[6523]: client XX.xx.XX.XX#61067/key rndc: updating zone "toto.int.local/IN": deleting rrset at "tata.toto.int.local" A
Jun 15 09:02:29 bind-vm00 named[6523]: zone toto.int.local/IN: sending notifies (serial 2012033125)
```

## Test your new record

To validate that the dns have created the new records, you can use your workstation and the `nslookup` command (from Windows, Linux or macOs)

```shell
nslookup -

> www.toto.int.local
> www.toto.int.local.
Serveur : UnKnown
Address: 51.144.181.124

Nom : www.toto.int.local
Addresses: 192.168.0.2
192.168.0.1
192.168.0.3
```

Now, you can create a DNS Module and create your VM and add them in your new nice Bind9 server.
