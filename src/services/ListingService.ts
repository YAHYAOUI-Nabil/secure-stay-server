import { EntityManager, In, Not } from "typeorm";
import { HostAwayClient } from "../client/HostAwayClient";
import { Listing } from "../entity/Listing";
import { ListingImage } from "../entity/ListingImage";
import { appDatabase } from "../utils/database.util";
import { Request } from "express";
import { ListingLockInfo } from "../entity/ListingLock";

export class ListingService {
  private hostAwayClient = new HostAwayClient();
  private listingRepository = appDatabase.getRepository(Listing);
  private listingLockRepository = appDatabase.getRepository(ListingLockInfo);

  // Fetch listings from hostaway client and save in our database if not present
  async syncHostawayListing() {
    const listings = await this.hostAwayClient.getListing();

    try {
      await appDatabase.manager.transaction(
        async (transactionalEntityManager) => {
          for (let i = 0; i < listings.length; i++) {
            const existingListing = await transactionalEntityManager.findOneBy(
              Listing,
              { id: listings[i]?.id }
            );

            if (!existingListing) {
              const listingObj = this.createListingObject(listings[i]);
              const savedListing = await transactionalEntityManager.save(
                Listing,
                listingObj
              );
              await this.saveListingImages(
                transactionalEntityManager,
                listings[i]["listingImages"],
                savedListing.listingId
              );
            }
          }
        }
      );

      return { success: true, message: "Listing synced successfully!" };
    } catch (error) {
      console.error("Error syncing listings:", error);
      throw error;
    }
  }

  // Create a listing object from hostaway client data
  private createListingObject(data: any) {
    return {
      id: data?.id,
      name: data?.name,
      description: data?.description,
      externalListingName: data?.externalListingName,
      address: data?.address,
      guests: data?.personCapacity,
      price: data?.price,
      guestsIncluded: data?.guestsIncluded,
      priceForExtraPerson: data?.priceForExtraPerson,
      currencyCode: data?.currencyCode,
      internalListingName: data?.internalListingName || "",
      country: data?.country || "",
      countryCode: data?.countryCode || "",
      state: data?.state || "",
      city: data?.city || "",
      street: data?.street || "",
      zipcode: data?.zipcode || "",
      lat: data?.lat || 0,
      lng: data?.lng || 0,
      propertyType: data?.bookingcomPropertyRoomName || "",
      checkInTimeStart: data?.checkInTimeStart || 0,
      checkInTimeEnd: data?.checkInTimeEnd || 0,
      checkOutTime: data?.checkOutTime || 0,
      wifiUsername: data?.wifiUsername || "(NO WIFI)",
      wifiPassword: data?.wifiPassword || "(NO PASSWORD)",
      bookingcomPropertyRoomName: data?.bookingcomPropertyRoomName || "",
    };
  }

  // Save listing images
  private async saveListingImages(
    entityManager: EntityManager,
    images: any[],
    listingId: number
  ) {
    const imageObjs = images.map((image) => ({
      caption: image.caption,
      vrboCaption: image.vrboCaption,
      airbnbCaption: image.airbnbCaption,
      url: image.url,
      sortOrder: image.sortOrder,
      listing: listingId,
    }));

    await entityManager.save(ListingImage, imageObjs);
  }

  // Fetch all available listings
  async getListings() {
    try {
      const listingsWithImages = await this.listingRepository
        .createQueryBuilder("listing")
        .leftJoinAndSelect("listing.images", "listingImages")
        .leftJoinAndSelect("listing.guideBook", "GuideBook")
        .getMany();
      return { success: true, listings: listingsWithImages };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getListingById(request: Request) {
    const { listing_id } = request.params;
    const result = await this.listingRepository
      .createQueryBuilder("listing")
      .leftJoinAndSelect("listing.images", "listingImages")
      .where("listing.listingId = :id", { id: Number(listing_id) })
      .getOne();

    return result;
  }

  async getDeviceIdByListingId(listing_id: number) {
    const listing = await this.listingRepository.findOne({
      where: { id: listing_id },
    });
    if (listing) {
      const listingLockInfo = await this.listingLockRepository.findOne({
        where: { listing_id: listing.listingId, status: 1 },
      });
      return listingLockInfo?.lock_id;
    } else {
      return null;
    }
  }
}

// import { EntityManager, In, Not } from 'typeorm';
// import { HostAwayClient } from '../client/HostAwayClient';
// import { Listing } from '../entity/Listing';
// import { ListingImage } from '../entity/ListingImage';
// import { appDatabase } from '../utils/database.util';
// import { Request } from 'express';
// import { ListingLockInfo } from '../entity/ListingLock';
// import { GuideBook } from '../entity/GuideBook';

// export class ListingService {
//   private hostAwayClient = new HostAwayClient();
//   private listingRepository = appDatabase.getRepository(Listing);
//   private listingLockRepository = appDatabase.getRepository(ListingLockInfo);

//   //fetch listings from hostaway client and save in our database if not present
//   async syncHostawayListing() {
//     const listing = await this.hostAwayClient.getListing();

//     try {
//       await appDatabase.manager.transaction(
//         async (transactionalEntityManager) => {
//           for (let i = 0; i < listing.length; i++) {
//             const existingListing = await transactionalEntityManager.findOneBy(
//               Listing,
//               { id: listing[i]?.id },
//             );

//             if (!existingListing) {
//               const listingObj = {
//                 id: listing[i]?.id,
//                 name: listing[i]?.name,
//                 description: listing[i]?.description,
//                 externalListingName: listing[i]?.externalListingName,
//                 address: listing[i]?.address,
//                 guests: listing[i]?.personCapacity,
//                 price: listing[i]?.price,
//                 guestsIncluded: listing[i]?.guestsIncluded,
//                 priceForExtraPerson: listing[i]?.priceForExtraPerson,
//                 currencyCode: listing[i]?.currencyCode,
//                 internalListingName: listing[i]?.internalListingName
//                   ? listing[i].internalListingName
//                   : '',
//                 country: listing[i]?.country ? listing[i].country : '',
//                 countryCode: listing[i]?.countryCode
//                   ? listing[i].countryCode
//                   : '',
//                 state: listing[i]?.state ? listing[i].state : '',
//                 city: listing[i]?.city ? listing[i].city : '',
//                 street: listing[i]?.street ? listing[i].street : '',
//                 zipcode: listing[i]?.zipcode ? listing[i].zipcode : '',
//                 lat: listing[i]?.lat ? listing[i].lat : 0,
//                 lng: listing[i]?.lng ? listing[i].lng : 0,
//                 propertyType: listing[i]?.bookingcomPropertyRoomName,
//                 checkInTimeStart: listing[i]?.checkInTimeStart
//                   ? listing[i].checkInTimeStart
//                   : 0,
//                 checkInTimeEnd: listing[i]?.checkInTimeEnd
//                   ? listing[i].checkInTimeEnd
//                   : 0,
//                 checkOutTime: listing[i]?.checkOutTime
//                   ? listing[i].checkOutTime
//                   : 0,
//                 wifiUsername: listing[i]?.wifiUsername
//                   ? listing[i].wifiUsername
//                   : '',
//                 wifiPassword: listing[i]?.wifiPassword
//                   ? listing[i].wifiPassword
//                   : '(NO PASSWORD)',
//                 bookingcomPropertyRoomName: listing[i]
//                   ?.bookingcomPropertyRoomName
//                   ? listing[i].bookingcomPropertyRoomName
//                   : '',
//               };
//               const saveListing = await transactionalEntityManager.save(
//                 Listing,
//                 listingObj,
//               );

//               for (let j = 0; j < listing[i]['listingImages'].length; j++) {
//                 const listingImageObj = {
//                   caption: listing[i]['listingImages'][j].caption,
//                   vrboCaption: listing[i]['listingImages'][j].vrboCaption,
//                   airbnbCaption: listing[i]['listingImages'][j].airbnbCaption,
//                   url: listing[i]['listingImages'][j].url,
//                   sortOrder: listing[i]['listingImages'][j].sortOrder,
//                   listing: saveListing.listingId,
//                 };
//                 await transactionalEntityManager.save(
//                   ListingImage,
//                   listingImageObj,
//                 );
//               }
//             }
//           }
//         },
//       );

//       return { success: true, message: 'Listing synced successfully!' };
//     } catch (error) {
//       console.error('Error syncing listings:', error);
//       throw error;
//     }
//   }

//   //fetch all available listings
//   async getListings() {
//     try {
//       const listingsWithImages = await this.listingRepository
//         .createQueryBuilder('listing')
//         .leftJoinAndSelect('listing.images', 'listingImages')
//         .leftJoinAndSelect('listing.guideBook', 'GuideBook')
//         .getMany();
//       return { success: true, listings: listingsWithImages };
//     } catch (error) {
//       console.log(error);
//       throw error;
//     }
//   }

//   async getListingById(request: Request) {
//     const { listing_id } = request.params;
//     const result = await this.listingRepository
//       .createQueryBuilder('listing')
//       .leftJoinAndSelect('listing.images', 'listingImages')
//       .where('listing.listingId = :id', { id: Number(listing_id) })
//       .getOne();

//     return result;
//   }

//   async getDeviceIdByListingId(listing_id: number) {
//     const listing = await this.listingRepository.findOne({
//       where: { id: listing_id },
//     });
//     if (listing) {
//       const listingLockInfo = await this.listingLockRepository.findOne({
//         where: { listing_id: listing.listingId, status: 1 },
//       });
//       return listingLockInfo?.lock_id;
//     } else {
//       return null;
//     }
//   }
// }
