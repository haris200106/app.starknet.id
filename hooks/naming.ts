basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-"
bigAlphabet = "这来"
small_size_plus = len(basicAlphabet) + 1
big_size_plus = len(bigAlphabet) + 1


def decode_felt_to_domain_string(felt):
    decoded = ""
    while felt != 0:
        code = felt % small_size_plus
        felt = felt // small_size_plus
        if code == len(basicAlphabet):
            next_felt = felt // big_size_plus
            if next_felt == 0:
                code2 = felt % big_size_plus
                felt = next_felt
                if code2 == 0:
                    decoded += basicAlphabet[0]
                else:
                    decoded += bigAlphabet[code2 - 1]
            else:
                code2 = felt % len(bigAlphabet)
                decoded += bigAlphabet[code2]
                felt = felt // len(bigAlphabet)
        else:
            decoded += basicAlphabet[code]
    return decoded


def encode(decoded):
    encoded = 0
    multiplier = 1
    for i in range(len(decoded)):
        char = decoded[i]
        try:
            index = basicAlphabet.index(char)
            if i == len(decoded) - 1 and decoded[i] == basicAlphabet[0]:
                encoded += multiplier * len(basicAlphabet)
                multiplier *= small_size_plus**2  # like adding 0
            else:
                encoded += multiplier * index
                multiplier *= small_size_plus
        except ValueError:
            encoded += multiplier * len(basicAlphabet)
            multiplier *= small_size_plus
            newid = int(i == len(decoded) - 1) + bigAlphabet.index(char)
            encoded += multiplier * newid
            multiplier *= len(bigAlphabet)
    return encoded
​

/* eslint-disable react-hooks/rules-of-hooks */
import BN from "bn.js";
import { BigNumberish } from "starknet/utils/number";
import { useStarknetCall } from "@starknet-react/core";
import { useNamingContract } from "./contracts";

const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
const basicSizePlusOne = new BN(basicAlphabet.length + 1);
const bigAlphabet = "这来";
const basicAlphabetSize = new BN(basicAlphabet.length);
const bigAlphabetSize = new BN(bigAlphabet.length);
const bigAlphabetSizePlusOne = new BN(bigAlphabet.length + 1);

export function useDecoded(encoded: BN[]): string {
  let decoded = "";
  for (let subdomain of encoded) {
    while (!subdomain.isZero()) {
      const code = subdomain.mod(basicSizePlusOne).toNumber();
      subdomain = subdomain.div(basicSizePlusOne);
      if (code === basicAlphabet.length) {
        const nextSubdomain = subdomain.div(bigAlphabetSizePlusOne);
        if (nextSubdomain.isZero()) {
          let code2 = subdomain.mod(bigAlphabetSizePlusOne).toNumber();
          subdomain = nextSubdomain;
          if (code2 === 0)
            decoded += basicAlphabet[0];
          else
            decoded += bigAlphabet[code2 - 1];
        } else {
          let code2 = subdomain.mod(bigAlphabetSize).toNumber();
          decoded += bigAlphabet[code2];
          subdomain = subdomain.div(bigAlphabetSize)
        }
      } else decoded += basicAlphabet[code];
    }
    decoded += ".";
  }
  return decoded + "stark";
}

export function useEncoded(decoded: string): BN {
  let encoded = new BN(0);
  let multiplier = new BN(1);

  for (let i = 0; i < decoded.length; i++) {
    const char = decoded[i];
    const index = basicAlphabet.indexOf(char);
    const bnIndex = new BN(basicAlphabet.indexOf(char));

    if (index !== -1) {
      // add encoded + multiplier * index
      if (i === decoded.length - 1 && decoded[i] === basicAlphabet[0]) {
        encoded = encoded.add(multiplier.mul(basicAlphabetSize));
        multiplier = multiplier.mul(basicSizePlusOne);
        // add 0
        multiplier = multiplier.mul(basicSizePlusOne);
      } else {
        encoded = encoded.add(multiplier.mul(bnIndex));
        multiplier = multiplier.mul(basicSizePlusOne);
      }
    } else if (bigAlphabet.indexOf(char) !== -1) {
      // add encoded + multiplier * (basicAlphabetSize)
      encoded = encoded.add(multiplier.mul(basicAlphabetSize));
      multiplier = multiplier.mul(basicSizePlusOne);
      // add encoded + multiplier * index
      let newid = (i === decoded.length - 1 ? 1 : 0) + bigAlphabet.indexOf(char);
      encoded = encoded.add(multiplier.mul(new BN(newid)));
      multiplier = multiplier.mul(bigAlphabetSize);
    }
  }

  return encoded;
}

type DomainData = {
  domain?: string;
  error?: string;
};

export function useDomainFromAddress(address: BigNumberish): DomainData {
  const { contract } = useNamingContract();
  const { data, error } = useStarknetCall({
    contract,
    method: "address_to_domain",
    args: [address],
  });

  if (!data || data?.["domain_len"] === 0) {
    return { domain: "", error: error ? error : "error" };
  } else {
    let domain = useDecoded(data[0] as any);
    return { domain: domain as any, error };
  }
}

type AddressData = {
  address?: any;
  error?: string;
};

export function useAddressFromDomain(domain: string): AddressData {
  const { contract } = useNamingContract();
  const encoded = [];
  for (const subdomain of domain.split("."))
    encoded.push(useEncoded(subdomain));

  const { data, error } = useStarknetCall({
    contract,
    method: "domain_to_address",
    args: [encoded],
  });

  return { address: data as any, error };
}

export function useIsValid(domain: string): boolean | string {
  for (const char of domain)
    if (!basicAlphabet.includes(char) && !bigAlphabet.includes(char))
      return char;
  return true;
}

type TokenIdData = {
  tokenId?: any;
  error?: string;
};

export function useTokenIdFromDomain(domain: string): TokenIdData {
  const { contract } = useNamingContract();
  const encoded = [];
  for (const subdomain of domain.split("."))
    encoded.push(useEncoded(subdomain));

  const { data, error } = useStarknetCall({
    contract,
    method: "domain_to_token_id",
    args: [encoded],
  });

  return { tokenId: data as any, error };
}

type ExpiryData = {
  expiry?: any;
  error?: string;
};

export function useExpiryFromDomain(domain: string): ExpiryData {
  const { contract } = useNamingContract();
  const encoded = [];
  for (const subdomain of domain.split("."))
    encoded.push(useEncoded(subdomain));

  const { data, error } = useStarknetCall({
    contract,
    method: "domain_to_expiry",
    args: [encoded],
  });

  return { expiry: data as any, error };
}
