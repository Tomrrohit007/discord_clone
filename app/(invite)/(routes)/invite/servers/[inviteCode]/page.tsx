import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type InviteCodeProps = {
  params: {
    inviteCode: string;
  };
};
const InviteCodePage = async ({ params }: InviteCodeProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }
  if (!params.inviteCode) {
    return redirect("/");
  }
  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const serverExist = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
    },
  });

  if (!serverExist) {
    return redirect("/not-found");
  }
  const server = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      inviteCode: uuidv4(),
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return null;
};

export default InviteCodePage;
